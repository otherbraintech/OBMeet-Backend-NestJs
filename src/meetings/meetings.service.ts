import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { title: string; description?: string }) {
    return this.prisma.meeting.create({
      data: {
        ...data,
        user_id: userId,
        status: 'PENDING',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.meeting.findMany({
      where: { 
        user_id: userId,
        NOT: { status: 'DELETED' }
      },
      include: {
        audioFile: true,
        participants: {
          include: { 
            participant: {
              include: { voiceSample: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.meeting.findFirst({
      where: { 
        id, 
        user_id: userId,
        NOT: { status: 'DELETED' }
      },
      include: {
        audioFile: true,
        participants: {
          include: { 
            participant: {
              include: { voiceSample: true }
            }
          }
        }
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.meeting.update({
      where: { id, user_id: userId },
      data: { status: 'DELETED' },
    });
  }

  async update(id: string, userId: string, data: any) {
    // Si viene audioUrl y es una URL real, creamos el MediaFile y lo vinculamos
    if (data.audioUrl && data.audioUrl.startsWith('http')) {
      const { audioUrl, durationSeconds, ...rest } = data;
      return this.prisma.meeting.update({
        where: { id, user_id: userId },
        data: {
          ...rest,
          durationSeconds,
          audioFile: {
            create: {
              url: audioUrl,
              filename: audioUrl.split('/').pop() || 'audio.mp3',
            }
          }
        },
      });
    }

    // Si es una URL de marcador (como local_storage), solo actualizamos los demás datos
    const { audioUrl, ...rest } = data;
    return this.prisma.meeting.update({
      where: { id, user_id: userId },
      data: rest,
    });
  }

  /**
   * Obtiene todos los participantes registrados por el usuario
   */
  async getMyParticipants(userId: string) {
    return (this.prisma as any).participant.findMany({
      where: { userId: userId },
      include: { voiceSample: true },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Agrega un participante a una reunión.
   */
  async addParticipant(meetingId: string, userId: string, data: { participantId?: string; name?: string; voiceSampleUrl?: string }) {
    let participantId = data.participantId;

    // Si no tenemos ID, creamos el participante nuevo
    if (!participantId) {
      if (!data.name) throw new Error('Nombre requerido para nuevo participante');

      let voiceSample;
      if (data.voiceSampleUrl) {
        voiceSample = {
          create: {
            url: data.voiceSampleUrl,
            filename: data.voiceSampleUrl.split('/').pop() || 'voice.mp3',
          }
        };
      }

      const newParticipant = await (this.prisma as any).participant.create({
        data: {
          name: data.name,
          user: { connect: { id: userId } },
          voiceSample: voiceSample
        }
      });
      participantId = newParticipant.id;
    }

    // Vinculamos a la reunión (tabla intermedia)
    // Usamos 'as any' para evitar errores de tipos si el cliente no se ha actualizado en el IDE
    return (this.prisma as any).meetingParticipant.upsert({
      where: {
        meetingId_participantId: {
          meetingId,
          participantId
        }
      },
      update: {}, 
      create: {
        meetingId,
        participantId
      },
      include: {
        participant: {
          include: { voiceSample: true }
        }
      }
    });
  }

  /**
   * Elimina un participante de una reunión
   */
  async removeParticipant(meetingId: string, participantId: string) {
    return (this.prisma as any).meetingParticipant.delete({
      where: {
        meetingId_participantId: {
          meetingId,
          participantId
        }
      }
    });
  }

  async updateAiResults(id: string, results: {
    aiAnalysis: any;
    metrics: any;
    transcript: any;
    durationSeconds: number;
  }) {
    return this.prisma.meeting.update({
      where: { id },
      data: {
        aiAnalysis: results.aiAnalysis,
        metrics: results.metrics,
        transcript: results.transcript,
        durationSeconds: results.durationSeconds,
        status: 'COMPLETED',
      },
    });
  }

  async processAudio(meetingId: string, userId: string) {
    console.log(`[ProcessAudio] Inicio para meetingId=${meetingId}, userId=${userId}`);
    
    try {
        const meeting = await this.findOne(meetingId, userId);
        if (!meeting) {
            console.error(`[ProcessAudio] Reunion no encontrada`);
            throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);
        }
        
        if (!meeting.audioFile) {
            console.error(`[ProcessAudio] Sin archivo de audio vinculado`);
            throw new HttpException('No audio file found for this meeting in DB', HttpStatus.BAD_REQUEST);
        }

        const formData = new FormData();
        formData.append('meetingId', meeting.id);
        formData.append('userId', userId);
        formData.append('meetingTitle', meeting.title);
        formData.append('audioDurationSeconds', String(meeting.durationSeconds || 0));

        // Handle Main Audio
        const audioUrl = meeting.audioFile.url;
        console.log(`[ProcessAudio] Descargando audio principal de: ${audioUrl}`);
        
        try {
            const audioStream = await axios.get(audioUrl, { responseType: 'stream' });
            // Necesario para que form-data reconozca el stream correctamente si no es fs.createReadStream
            formData.append('audio_main', audioStream.data, {
                filename: 'meeting_audio.m4a',
                contentType: 'audio/m4a'
            });
        } catch (error) {
            console.error(`[ProcessAudio] Error descargando audio principal:`, error.message);
            throw new HttpException(`Failed to download main audio from ${audioUrl}: ${error.message}`, HttpStatus.BAD_GATEWAY);
        }

        // Handle Participants
        const participantMetadata: any[] = [];
        for (const p of meeting.participants) {
            if (p.participant.voiceSample && p.participant.voiceSample.url) {
                try {
                    console.log(`[ProcessAudio] Descargando muestra de voz para ${p.participant.name}`);
                    const pStream = await axios.get(p.participant.voiceSample.url, { responseType: 'stream' });
                    const fieldName = `participant_audio_${p.participant.id}`;
                    
                    formData.append(fieldName, pStream.data, {
                         filename: 'voice_sample.m4a',
                         contentType: 'audio/m4a'
                    });
                    
                    participantMetadata.push({
                        id: p.participant.id,
                        name: p.participant.name,
                        duration: 10, 
                        fieldName: fieldName
                    });
                } catch (err) {
                    console.error(`[ProcessAudio] Fallo descarga voz participante ${p.participant.name}`, err.message);
                    // Continuamos sin este audio, no es crítico para detener todo el proceso
                }
            }
        }
        
        formData.append('participants_metadata', JSON.stringify(participantMetadata));

        console.log(`[ProcessAudio] Payload preparado. Enviando a Python Backend...`);
        // Use env var or default
        const pythonUrl = process.env.PYTHON_PROCESS_URL || 'https://intelexia-labs-ob-meet-phyton.af9gwe.easypanel.host/meetings/process';
        console.log(`[ProcessAudio] Target URL: ${pythonUrl}`);
        
        const response = await axios.post(pythonUrl, formData, {
            headers: {
                ...formData.getHeaders(),
                // Importante: A veces el content-length calculado automáticamente falla con streams de red
                // Dejamos que axios/form-data lo manejen en modo 'chunked' si es necesario
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log(`[ProcessAudio] Respuesta exitosa de Python:`, response.data);

        // Update status to processing
        await this.update(meetingId, userId, { status: 'processing' });
        
        return response.data;

    } catch (error) {
        console.error('[ProcessAudio] Error General:', error);
        
        // Si ya es HttpException, relanzar
        if (error instanceof HttpException) {
            throw error;
        }

        // Si es error de Axios contra Python
        if (error.response) {
            console.error('[ProcessAudio] Python Response Error:', error.response.data);
            const detail = JSON.stringify(error.response.data);
            throw new HttpException(`Python Backend Error: ${detail}`, HttpStatus.BAD_GATEWAY);
        }
        
        // Error genérico
        throw new HttpException(`Internal Processing Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

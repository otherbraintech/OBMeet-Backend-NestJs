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

  async processAudio(meetingId: string, userId: string, fallbackAudioUrl?: string, files?: Array<Express.Multer.File>) {
    console.log(`[ProcessAudio] Inicio para meetingId=${meetingId}, userId=${userId}`);
    
    try {
        const meeting = await this.findOne(meetingId, userId);
        if (!meeting) {
            console.error(`[ProcessAudio] Reunion no encontrada`);
            throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);
        }

        const formData = new FormData();
        formData.append('meetingId', meeting.id);
        formData.append('userId', userId);
        formData.append('meetingTitle', meeting.title);
        formData.append('audioDurationSeconds', String(meeting.durationSeconds || 0));

        // 1. Handle Main Audio
        const uploadedMain = files?.find(f => f.fieldname === 'audio_main');
        
        if (uploadedMain) {
            console.log(`[ProcessAudio] Usando archivo subido por cliente: ${uploadedMain.originalname} (${uploadedMain.size} bytes)`);
            formData.append('audio_main', uploadedMain.buffer, {
                filename: uploadedMain.originalname || 'meeting_audio.m4a',
                contentType: uploadedMain.mimetype || 'audio/m4a'
            });
        } else {
            // Check Link / Fallback
            let audioUrl: string;
            if (meeting.audioFile && meeting.audioFile.url) {
                 audioUrl = meeting.audioFile.url;
            } else if (fallbackAudioUrl && fallbackAudioUrl.startsWith('http')) {
                 console.log(`[ProcessAudio] Usando fallback URL remota: ${fallbackAudioUrl}`);
                 audioUrl = fallbackAudioUrl;
            } else {
                 console.error(`[ProcessAudio] Sin archivo main y sin URL válida (fallbackUrl=${fallbackAudioUrl})`);
                 throw new HttpException('No audio file provided (upload or link)', HttpStatus.BAD_REQUEST);
            }
            
            console.log(`[ProcessAudio] Descargando audio principal de: ${audioUrl}`);
            try {
                const audioStream = await axios.get(audioUrl, { responseType: 'stream' });
                formData.append('audio_main', audioStream.data, {
                    filename: 'meeting_audio.m4a',
                    contentType: 'audio/m4a'
                });
            } catch (error) {
                console.error(`[ProcessAudio] Error descargando audio principal:`, error.message);
                throw new HttpException(`Failed to download main audio from ${audioUrl}: ${error.message}`, HttpStatus.BAD_GATEWAY);
            }
        }

        // 2. Handle Participants
        const participantMetadata: any[] = [];
        
        for (const p of meeting.participants) {
            const fieldName = `participant_audio_${p.participant.id}`;
            const uploadedPart = files?.find(f => f.fieldname === fieldName);
            
            let hasAudio = false;

            // Opción A: Archivo subido
            if (uploadedPart) {
                 console.log(`[ProcessAudio] Usando voz subida para ${p.participant.name}`);
                 formData.append(fieldName, uploadedPart.buffer, {
                    filename: uploadedPart.originalname || 'voice_sample.m4a',
                    contentType: uploadedPart.mimetype || 'audio/m4a'
                 });
                 hasAudio = true;
            } 
            // Opción B: Descargar de URL
            else if (p.participant.voiceSample && p.participant.voiceSample.url) {
                try {
                    console.log(`[ProcessAudio] Descargando muestra de voz para ${p.participant.name}`);
                    const pStream = await axios.get(p.participant.voiceSample.url, { responseType: 'stream' });
                    
                    formData.append(fieldName, pStream.data, {
                         filename: 'voice_sample.m4a',
                         contentType: 'audio/m4a'
                    });
                    hasAudio = true;
                } catch (err) {
                    console.error(`[ProcessAudio] Fallo descarga voz participante ${p.participant.name}`, err.message);
                }
            }
            
            if (hasAudio) {
                participantMetadata.push({
                    id: p.participant.id,
                    name: p.participant.name,
                    duration: 10, 
                    fieldName: fieldName
                });
            }
        }
        
        formData.append('participants_metadata', JSON.stringify(participantMetadata));

        console.log(`[ProcessAudio] Payload preparado. Enviando a Python Backend...`);
        const pythonUrl = process.env.PYTHON_PROCESS_URL || 'https://intelexia-labs-ob-meet-phyton.af9gwe.easypanel.host/meetings/process';
        console.log(`[ProcessAudio] Target URL: ${pythonUrl}`);
        
        const response = await axios.post(pythonUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log(`[ProcessAudio] Respuesta exitosa de Python:`, response.data);

        await this.update(meetingId, userId, { status: 'processing' });
        return response.data;

    } catch (error) {
        console.error('[ProcessAudio] Error General:', error);
        if (error instanceof HttpException) throw error;
        if (error.response) {
            console.error('[ProcessAudio] Python Response Error:', error.response.data);
            const detail = JSON.stringify(error.response.data);
            throw new HttpException(`Python Backend Error: ${detail}`, HttpStatus.BAD_GATEWAY);
        }
        throw new HttpException(`Internal Processing Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

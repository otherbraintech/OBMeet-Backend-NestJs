import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import FormData = require('form-data');

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
    const meeting = await this.findOne(meetingId, userId);
    if (!meeting) throw new Error('Meeting not found');
    if (!meeting.audioFile) throw new Error('No audio file found for this meeting');

    const formData = new FormData();
    formData.append('meetingId', meeting.id);
    formData.append('userId', userId);
    formData.append('meetingTitle', meeting.title);
    formData.append('audioDurationSeconds', String(meeting.durationSeconds || 0));

    // Handle Main Audio
    const audioUrl = meeting.audioFile.url;
    console.log(`Downloading main audio from: ${audioUrl}`);
    const audioStream = await axios.get(audioUrl, { responseType: 'stream' });
    formData.append('audio_main', audioStream.data, 'meeting_audio.m4a');

    // Handle Participants
    const participantMetadata: any[] = [];
    for (const p of meeting.participants) {
      if (p.participant.voiceSample && p.participant.voiceSample.url) {
        try {
            console.log(`Downloading voice sample for ${p.participant.name} from: ${p.participant.voiceSample.url}`);
            const pStream = await axios.get(p.participant.voiceSample.url, { responseType: 'stream' });
            const fieldName = `participant_audio_${p.participant.id}`;
            formData.append(fieldName, pStream.data, 'voice_sample.m4a');
            
            participantMetadata.push({
                id: p.participant.id,
                name: p.participant.name,
                duration: 10, 
                fieldName: fieldName
            });
        } catch (err) {
            console.error(`Failed to download voice sample for ${p.participant.name}`, err);
            participantMetadata.push({
                id: p.participant.id,
                name: p.participant.name,
                duration: 10,
                fieldName: null
            });
        }
      } else {
         participantMetadata.push({
            id: p.participant.id,
            name: p.participant.name,
            duration: 10,
            fieldName: null 
        });
      }
    }
    formData.append('participants_metadata', JSON.stringify(participantMetadata));

    console.log(`Envio a Python Backend...`);
    // Use env var or default
    const pythonUrl = process.env.PYTHON_PROCESS_URL || 'https://intelexia-labs-ob-meet-phyton.af9gwe.easypanel.host/meetings/process';
    
    try {
        const response = await axios.post(pythonUrl, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        // Update status to processing
        await this.update(meetingId, userId, { status: 'processing' });
        
        return response.data;
    } catch (error) {
        console.error('Error sending to Python backend:', error.message);
        if (error.response) {
            console.error('Python response data:', error.response.data);
            throw new Error(`Python Backend Error: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
  }
}

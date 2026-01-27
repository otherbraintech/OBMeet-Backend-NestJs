import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}

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
          include: { voiceSample: true }
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
          include: { voiceSample: true }
        }
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.meeting.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async update(id: string, userId: string, data: any) {
    // Si viene audioUrl y es una URL real, creamos el MediaFile y lo vinculamos
    if (data.audioUrl && data.audioUrl.startsWith('http')) {
      const { audioUrl, durationSeconds, ...rest } = data;
      return this.prisma.meeting.update({
        where: { id },
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
      where: { id },
      data: rest,
    });
  }

  // Nuevo método para agregar participantes con su audio
  async addParticipant(meetingId: string, data: { id?: string; name: string; role?: string; voiceSampleUrl?: string }) {
    const createData: any = {
      name: data.name,
      role: data.role,
      meeting: { connect: { id: meetingId } },
    };

    // Solo asignar ID si viene del frontend y no es vacío
    if (data.id) {
      createData.id = data.id;
    }

    if (data.voiceSampleUrl && data.voiceSampleUrl.startsWith('http')) {
      createData.voiceSample = {
        create: {
          url: data.voiceSampleUrl,
          filename: data.voiceSampleUrl.split('/').pop() || 'voice.mp3',
        }
      };
    }

    return this.prisma.participant.create({
      data: createData,
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { title: string; description?: string }) {
    return this.prisma.meeting.create({
      data: {
        ...data,
        ownerId: userId,
        status: 'PENDING',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.meeting.findMany({
      where: { ownerId: userId },
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
      where: { id, ownerId: userId },
      include: {
        audioFile: true,
        participants: {
          include: { voiceSample: true }
        }
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    // Si viene audioUrl, creamos el MediaFile y lo vinculamos
    if (data.audioUrl) {
      const { audioUrl, durationSeconds, ...rest } = data;
      return this.prisma.meeting.update({
        where: { id, ownerId: userId },
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

    return this.prisma.meeting.update({
      where: { id, ownerId: userId },
      data,
    });
  }

  // Nuevo método para agregar participantes con su audio
  async addParticipant(meetingId: string, data: { name: string; role?: string; voiceSampleUrl?: string }) {
    return this.prisma.participant.create({
      data: {
        name: data.name,
        role: data.role,
        meetingId: meetingId,
        voiceSample: data.voiceSampleUrl ? {
          create: {
            url: data.voiceSampleUrl,
            filename: data.voiceSampleUrl.split('/').pop() || 'voice.mp3',
          }
        } : undefined,
      },
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

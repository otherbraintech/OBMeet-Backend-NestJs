"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MeetingsService = class MeetingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        return this.prisma.meeting.create({
            data: {
                ...data,
                ownerId: userId,
                status: 'PENDING',
            },
        });
    }
    async findAll(userId) {
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
    async findOne(id, userId) {
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
    async update(id, userId, data) {
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
    async addParticipant(meetingId, data) {
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
    async updateAiResults(id, results) {
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
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map
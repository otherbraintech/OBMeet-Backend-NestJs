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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
const FormData = require("form-data");
let MeetingsService = class MeetingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        return this.prisma.meeting.create({
            data: {
                ...data,
                user_id: userId,
                status: 'PENDING',
            },
        });
    }
    async findAll(userId) {
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
    async findOne(id, userId) {
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
    async softDelete(id, userId) {
        return this.prisma.meeting.update({
            where: { id, user_id: userId },
            data: { status: 'DELETED' },
        });
    }
    async update(id, userId, data) {
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
        const { audioUrl, ...rest } = data;
        return this.prisma.meeting.update({
            where: { id, user_id: userId },
            data: rest,
        });
    }
    async getMyParticipants(userId) {
        return this.prisma.participant.findMany({
            where: { userId: userId },
            include: { voiceSample: true },
            orderBy: { name: 'asc' }
        });
    }
    async addParticipant(meetingId, userId, data) {
        let participantId = data.participantId;
        if (!participantId) {
            if (!data.name)
                throw new Error('Nombre requerido para nuevo participante');
            let voiceSample;
            if (data.voiceSampleUrl) {
                voiceSample = {
                    create: {
                        url: data.voiceSampleUrl,
                        filename: data.voiceSampleUrl.split('/').pop() || 'voice.mp3',
                    }
                };
            }
            const newParticipant = await this.prisma.participant.create({
                data: {
                    name: data.name,
                    user: { connect: { id: userId } },
                    voiceSample: voiceSample
                }
            });
            participantId = newParticipant.id;
        }
        return this.prisma.meetingParticipant.upsert({
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
    async removeParticipant(meetingId, participantId) {
        return this.prisma.meetingParticipant.delete({
            where: {
                meetingId_participantId: {
                    meetingId,
                    participantId
                }
            }
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
    async processAudio(meetingId, userId) {
        const meeting = await this.findOne(meetingId, userId);
        if (!meeting)
            throw new Error('Meeting not found');
        if (!meeting.audioFile)
            throw new Error('No audio file found for this meeting');
        const formData = new FormData();
        formData.append('meetingId', meeting.id);
        formData.append('userId', userId);
        formData.append('meetingTitle', meeting.title);
        formData.append('audioDurationSeconds', String(meeting.durationSeconds || 0));
        const audioUrl = meeting.audioFile.url;
        console.log(`Downloading main audio from: ${audioUrl}`);
        const audioStream = await axios_1.default.get(audioUrl, { responseType: 'stream' });
        formData.append('audio_main', audioStream.data, 'meeting_audio.m4a');
        const participantMetadata = [];
        for (const p of meeting.participants) {
            if (p.participant.voiceSample && p.participant.voiceSample.url) {
                try {
                    console.log(`Downloading voice sample for ${p.participant.name} from: ${p.participant.voiceSample.url}`);
                    const pStream = await axios_1.default.get(p.participant.voiceSample.url, { responseType: 'stream' });
                    const fieldName = `participant_audio_${p.participant.id}`;
                    formData.append(fieldName, pStream.data, 'voice_sample.m4a');
                    participantMetadata.push({
                        id: p.participant.id,
                        name: p.participant.name,
                        duration: 10,
                        fieldName: fieldName
                    });
                }
                catch (err) {
                    console.error(`Failed to download voice sample for ${p.participant.name}`, err);
                }
            }
        }
        formData.append('participants_metadata', JSON.stringify(participantMetadata));
        console.log(`Envio a Python Backend...`);
        const pythonUrl = process.env.PYTHON_PROCESS_URL || 'https://intelexia-labs-ob-meet-phyton.af9gwe.easypanel.host/meetings/process';
        try {
            const response = await axios_1.default.post(pythonUrl, formData, {
                headers: formData.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });
            await this.update(meetingId, userId, { status: 'processing' });
            return response.data;
        }
        catch (error) {
            console.error('Error sending to Python backend:', error.message);
            if (error.response) {
                console.error('Python response data:', error.response.data);
                throw new Error(`Python Backend Error: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map
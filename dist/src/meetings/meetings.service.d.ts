import { PrismaService } from '../prisma/prisma.service';
export declare class MeetingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        title: string;
        description?: string;
    }): Promise<{
        id: string;
        title: string;
        description: string | null;
        date: Date;
        durationSeconds: number | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        participantsAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        actionItems: import("@prisma/client/runtime/client").JsonValue | null;
        decisions: import("@prisma/client/runtime/client").JsonValue | null;
        speakerInsights: import("@prisma/client/runtime/client").JsonValue | null;
        conversationDynamics: import("@prisma/client/runtime/client").JsonValue | null;
        nextMeetingPreparation: import("@prisma/client/runtime/client").JsonValue | null;
        status: string;
        user_id: string;
        createdAt: Date;
        updatedAt: Date;
        audioFileId: number | null;
    }>;
    findAll(userId: string): Promise<({
        audioFile: {
            url: string;
            id: number;
            createdAt: Date;
            filename: string;
            mimeType: string | null;
            size: number | null;
        } | null;
        participants: ({
            participant: {
                voiceSample: {
                    url: string;
                    id: number;
                    createdAt: Date;
                    filename: string;
                    mimeType: string | null;
                    size: number | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                name: string;
                voiceSampleId: number | null;
                userId: string;
            };
        } & {
            createdAt: Date;
            meetingId: string;
            participantId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        date: Date;
        durationSeconds: number | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        participantsAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        actionItems: import("@prisma/client/runtime/client").JsonValue | null;
        decisions: import("@prisma/client/runtime/client").JsonValue | null;
        speakerInsights: import("@prisma/client/runtime/client").JsonValue | null;
        conversationDynamics: import("@prisma/client/runtime/client").JsonValue | null;
        nextMeetingPreparation: import("@prisma/client/runtime/client").JsonValue | null;
        status: string;
        user_id: string;
        createdAt: Date;
        updatedAt: Date;
        audioFileId: number | null;
    })[]>;
    findOne(id: string, userId: string): Promise<({
        audioFile: {
            url: string;
            id: number;
            createdAt: Date;
            filename: string;
            mimeType: string | null;
            size: number | null;
        } | null;
        participants: ({
            participant: {
                voiceSample: {
                    url: string;
                    id: number;
                    createdAt: Date;
                    filename: string;
                    mimeType: string | null;
                    size: number | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                name: string;
                voiceSampleId: number | null;
                userId: string;
            };
        } & {
            createdAt: Date;
            meetingId: string;
            participantId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        date: Date;
        durationSeconds: number | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        participantsAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        actionItems: import("@prisma/client/runtime/client").JsonValue | null;
        decisions: import("@prisma/client/runtime/client").JsonValue | null;
        speakerInsights: import("@prisma/client/runtime/client").JsonValue | null;
        conversationDynamics: import("@prisma/client/runtime/client").JsonValue | null;
        nextMeetingPreparation: import("@prisma/client/runtime/client").JsonValue | null;
        status: string;
        user_id: string;
        createdAt: Date;
        updatedAt: Date;
        audioFileId: number | null;
    }) | null>;
    softDelete(id: string, userId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        date: Date;
        durationSeconds: number | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        participantsAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        actionItems: import("@prisma/client/runtime/client").JsonValue | null;
        decisions: import("@prisma/client/runtime/client").JsonValue | null;
        speakerInsights: import("@prisma/client/runtime/client").JsonValue | null;
        conversationDynamics: import("@prisma/client/runtime/client").JsonValue | null;
        nextMeetingPreparation: import("@prisma/client/runtime/client").JsonValue | null;
        status: string;
        user_id: string;
        createdAt: Date;
        updatedAt: Date;
        audioFileId: number | null;
    }>;
    update(id: string, userId: string, data: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        date: Date;
        durationSeconds: number | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        participantsAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        actionItems: import("@prisma/client/runtime/client").JsonValue | null;
        decisions: import("@prisma/client/runtime/client").JsonValue | null;
        speakerInsights: import("@prisma/client/runtime/client").JsonValue | null;
        conversationDynamics: import("@prisma/client/runtime/client").JsonValue | null;
        nextMeetingPreparation: import("@prisma/client/runtime/client").JsonValue | null;
        status: string;
        user_id: string;
        createdAt: Date;
        updatedAt: Date;
        audioFileId: number | null;
    }>;
    getMyParticipants(userId: string): Promise<any>;
    addParticipant(meetingId: string, userId: string, data: {
        participantId?: string;
        name?: string;
        voiceSampleUrl?: string;
    }): Promise<any>;
    removeParticipant(meetingId: string, participantId: string): Promise<any>;
    updateAiResults(id: string, results: {
        aiAnalysis: any;
        metrics: any;
        transcript: any;
        durationSeconds: number;
    }): Promise<{
        id: string;
        title: string;
        description: string | null;
        date: Date;
        durationSeconds: number | null;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        participantsAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        actionItems: import("@prisma/client/runtime/client").JsonValue | null;
        decisions: import("@prisma/client/runtime/client").JsonValue | null;
        speakerInsights: import("@prisma/client/runtime/client").JsonValue | null;
        conversationDynamics: import("@prisma/client/runtime/client").JsonValue | null;
        nextMeetingPreparation: import("@prisma/client/runtime/client").JsonValue | null;
        status: string;
        user_id: string;
        createdAt: Date;
        updatedAt: Date;
        audioFileId: number | null;
    }>;
    processAudio(meetingId: string, userId: string): Promise<any>;
}

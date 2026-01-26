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
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        audioFileId: number | null;
    }>;
    findAll(userId: string): Promise<({
        audioFile: {
            id: number;
            createdAt: Date;
            url: string;
            filename: string;
            mimeType: string | null;
            size: number | null;
        } | null;
        participants: ({
            voiceSample: {
                id: number;
                createdAt: Date;
                url: string;
                filename: string;
                mimeType: string | null;
                size: number | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            name: string;
            role: string | null;
            meetingId: string;
            voiceSampleId: number | null;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        audioFileId: number | null;
    })[]>;
    findOne(id: string, userId: string): Promise<({
        audioFile: {
            id: number;
            createdAt: Date;
            url: string;
            filename: string;
            mimeType: string | null;
            size: number | null;
        } | null;
        participants: ({
            voiceSample: {
                id: number;
                createdAt: Date;
                url: string;
                filename: string;
                mimeType: string | null;
                size: number | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            name: string;
            role: string | null;
            meetingId: string;
            voiceSampleId: number | null;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        audioFileId: number | null;
    }) | null>;
    softDelete(id: string, userId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        audioFileId: number | null;
    }>;
    update(id: string, userId: string, data: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        audioFileId: number | null;
    }>;
    addParticipant(meetingId: string, data: {
        id?: string;
        name: string;
        role?: string;
        voiceSampleUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        role: string | null;
        meetingId: string;
        voiceSampleId: number | null;
    }>;
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
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        audioFileId: number | null;
    }>;
}

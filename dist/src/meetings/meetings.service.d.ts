import { PrismaService } from '../prisma/prisma.service';
export declare class MeetingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        title: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        audioFileId: string | null;
        ownerId: string;
    }>;
    findAll(userId: string): Promise<({
        audioFile: {
            id: string;
            createdAt: Date;
            url: string;
            filename: string;
            mimeType: string | null;
            size: number | null;
        } | null;
        participants: ({
            voiceSample: {
                id: string;
                createdAt: Date;
                url: string;
                filename: string;
                mimeType: string | null;
                size: number | null;
            } | null;
        } & {
            name: string;
            id: string;
            createdAt: Date;
            role: string | null;
            voiceSampleId: string | null;
            meetingId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        audioFileId: string | null;
        ownerId: string;
    })[]>;
    findOne(id: string, userId: string): Promise<({
        audioFile: {
            id: string;
            createdAt: Date;
            url: string;
            filename: string;
            mimeType: string | null;
            size: number | null;
        } | null;
        participants: ({
            voiceSample: {
                id: string;
                createdAt: Date;
                url: string;
                filename: string;
                mimeType: string | null;
                size: number | null;
            } | null;
        } & {
            name: string;
            id: string;
            createdAt: Date;
            role: string | null;
            voiceSampleId: string | null;
            meetingId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        audioFileId: string | null;
        ownerId: string;
    }) | null>;
    update(id: string, userId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        audioFileId: string | null;
        ownerId: string;
    }>;
    addParticipant(meetingId: string, data: {
        name: string;
        role?: string;
        voiceSampleUrl?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: string | null;
        voiceSampleId: string | null;
        meetingId: string;
    }>;
    updateAiResults(id: string, results: {
        aiAnalysis: any;
        metrics: any;
        transcript: any;
        durationSeconds: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        date: Date;
        aiAnalysis: import("@prisma/client/runtime/client").JsonValue | null;
        transcript: import("@prisma/client/runtime/client").JsonValue | null;
        metrics: import("@prisma/client/runtime/client").JsonValue | null;
        durationSeconds: number | null;
        status: string;
        audioFileId: string | null;
        ownerId: string;
    }>;
}

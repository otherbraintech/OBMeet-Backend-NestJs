import { MeetingsService } from './meetings.service';
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    create(req: any, body: {
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
    findAll(req: any): Promise<({
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
    findOne(req: any, id: string): Promise<({
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
    update(req: any, id: string, body: any): Promise<{
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
    remove(req: any, id: string): Promise<{
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
    addParticipant(id: string, body: {
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
    webhookResult(id: string, body: any): Promise<{
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

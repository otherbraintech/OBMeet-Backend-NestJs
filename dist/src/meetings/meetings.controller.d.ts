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
    findAll(req: any): Promise<({
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
    findAllParticipants(req: any): Promise<any>;
    findOne(req: any, id: string): Promise<({
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
    update(req: any, id: string, body: any): Promise<{
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
    remove(req: any, id: string): Promise<{
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
    addParticipant(req: any, id: string, body: {
        participantId?: string;
        name?: string;
        voiceSampleUrl?: string;
    }): Promise<any>;
    removeParticipant(id: string, participantId: string): Promise<any>;
    processAudio(req: any, id: string): Promise<any>;
    webhookResult(id: string, body: any): Promise<{
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
}

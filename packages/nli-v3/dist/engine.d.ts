import type { NLIv3Config, NLIv3Response } from "./types.js";
import { ConversationManager } from "./conversation.js";
export declare class NLIV3Engine {
    private config;
    private conversationManager;
    private clarificationEngine;
    constructor(config?: Partial<NLIv3Config>);
    processMessage(sessionId: string, userId: string, message: string): Promise<NLIv3Response>;
    processClarification(sessionId: string, slotName: string, value: string): Promise<NLIv3Response>;
    private classifyIntent;
    private computeConfidence;
    private extractSlots;
    private generateResponse;
    getConversationManager(): ConversationManager;
}

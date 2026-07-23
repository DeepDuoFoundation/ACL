import type { ConversationContext, Intent, Slot } from "./types.js";
export declare class ConversationManager {
    private contexts;
    private classifier;
    private slotExtractor;
    constructor(config: {
        maxSlots: number;
        confidenceThreshold: number;
    });
    processMessage(sessionId: string, message: string): Promise<{
        intent: Intent;
        slots: Slot[];
        context: ConversationContext;
    }>;
    addAssistantResponse(sessionId: string, response: string): Promise<void>;
    getContext(sessionId: string): ConversationContext | undefined;
    clearContext(sessionId: string): Promise<void>;
    getActiveSessions(): string[];
}
//# sourceMappingURL=conversation.d.ts.map
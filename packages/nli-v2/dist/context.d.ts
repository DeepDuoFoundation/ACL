import type { ConversationState } from "./types.js";
export declare class ContextManager {
    private conversations;
    getOrCreate(sessionId: string, userId: string): ConversationState;
    addToHistory(state: ConversationState, role: "user" | "assistant", content: string): void;
    setContext(state: ConversationState, key: string, value: unknown): void;
    getContext(state: ConversationState, key: string): unknown;
    getRecentHistory(state: ConversationState, count: number): Array<{
        role: string;
        content: string;
    }>;
    clearSession(sessionId: string): void;
    getActiveSessions(): string[];
}
//# sourceMappingURL=context.d.ts.map
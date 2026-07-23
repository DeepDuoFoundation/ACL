import type { ConversationSession, ConversationTurn } from "./types.js";
export declare class ConversationManager {
    private sessions;
    createSession(sessionId: string, userId: string): ConversationSession;
    getSession(sessionId: string): ConversationSession | undefined;
    getOrCreateSession(sessionId: string, userId: string): ConversationSession;
    addTurn(sessionId: string, turn: ConversationTurn): void;
    mergeSlots(sessionId: string, newSlots: Record<string, unknown>): Record<string, unknown>;
    getSlot(sessionId: string, slotName: string): unknown | undefined;
    isExpired(sessionId: string, timeoutMs: number): boolean;
    getRecentTurns(sessionId: string, count: number): ConversationTurn[];
    deleteSession(sessionId: string): boolean;
}

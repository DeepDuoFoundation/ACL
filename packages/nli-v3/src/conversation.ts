import type { ConversationSession, ConversationTurn } from "./types.js";

export class ConversationManager {
  private sessions = new Map<string, ConversationSession>();

  createSession(sessionId: string, userId: string): ConversationSession {
    const session: ConversationSession = {
      id: sessionId,
      userId,
      turns: [],
      accumulatedSlots: {},
      currentIntent: null,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getOrCreateSession(sessionId: string, userId: string): ConversationSession {
    return this.sessions.get(sessionId) ?? this.createSession(sessionId, userId);
  }

  addTurn(sessionId: string, turn: ConversationTurn): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    session.turns.push(turn);
    session.lastActiveAt = Date.now();
    if (turn.slots) {
      Object.assign(session.accumulatedSlots, turn.slots);
    }
    if (turn.intent) {
      session.currentIntent = turn.intent;
    }
  }

  mergeSlots(sessionId: string, newSlots: Record<string, unknown>): Record<string, unknown> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    Object.assign(session.accumulatedSlots, newSlots);
    return { ...session.accumulatedSlots };
  }

  getSlot(sessionId: string, slotName: string): unknown | undefined {
    const session = this.sessions.get(sessionId);
    return session?.accumulatedSlots[slotName];
  }

  isExpired(sessionId: string, timeoutMs: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return true;
    return Date.now() - session.lastActiveAt > timeoutMs;
  }

  getRecentTurns(sessionId: string, count: number): ConversationTurn[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.turns.slice(-count);
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}

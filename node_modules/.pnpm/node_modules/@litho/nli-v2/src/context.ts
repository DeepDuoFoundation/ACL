import type { ConversationState } from "./types.js";

export class ContextManager {
  private conversations = new Map<string, ConversationState>();

  getOrCreate(sessionId: string, userId: string): ConversationState {
    let state = this.conversations.get(sessionId);
    if (!state) {
      state = {
        sessionId,
        userId,
        history: [],
        context: new Map(),
        turnCount: 0,
      };
      this.conversations.set(sessionId, state);
    }
    return state;
  }

  addToHistory(state: ConversationState, role: "user" | "assistant", content: string): void {
    state.history.push({ role, content, timestamp: Date.now() });
    state.turnCount++;
  }

  setContext(state: ConversationState, key: string, value: unknown): void {
    state.context.set(key, value);
  }

  getContext(state: ConversationState, key: string): unknown {
    return state.context.get(key);
  }

  getRecentHistory(state: ConversationState, count: number): Array<{ role: string; content: string }> {
    return state.history.slice(-count);
  }

  clearSession(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  getActiveSessions(): string[] {
    return Array.from(this.conversations.keys());
  }
}

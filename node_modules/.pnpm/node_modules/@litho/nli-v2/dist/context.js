export class ContextManager {
    conversations = new Map();
    getOrCreate(sessionId, userId) {
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
    addToHistory(state, role, content) {
        state.history.push({ role, content, timestamp: Date.now() });
        state.turnCount++;
    }
    setContext(state, key, value) {
        state.context.set(key, value);
    }
    getContext(state, key) {
        return state.context.get(key);
    }
    getRecentHistory(state, count) {
        return state.history.slice(-count);
    }
    clearSession(sessionId) {
        this.conversations.delete(sessionId);
    }
    getActiveSessions() {
        return Array.from(this.conversations.keys());
    }
}
//# sourceMappingURL=context.js.map
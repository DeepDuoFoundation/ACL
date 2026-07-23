export class ConversationManager {
    sessions = new Map();
    createSession(sessionId, userId) {
        const session = {
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
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    getOrCreateSession(sessionId, userId) {
        return this.sessions.get(sessionId) ?? this.createSession(sessionId, userId);
    }
    addTurn(sessionId, turn) {
        const session = this.sessions.get(sessionId);
        if (!session)
            throw new Error(`Session not found: ${sessionId}`);
        session.turns.push(turn);
        session.lastActiveAt = Date.now();
        if (turn.slots) {
            Object.assign(session.accumulatedSlots, turn.slots);
        }
        if (turn.intent) {
            session.currentIntent = turn.intent;
        }
    }
    mergeSlots(sessionId, newSlots) {
        const session = this.sessions.get(sessionId);
        if (!session)
            throw new Error(`Session not found: ${sessionId}`);
        Object.assign(session.accumulatedSlots, newSlots);
        return { ...session.accumulatedSlots };
    }
    getSlot(sessionId, slotName) {
        const session = this.sessions.get(sessionId);
        return session?.accumulatedSlots[slotName];
    }
    isExpired(sessionId, timeoutMs) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return true;
        return Date.now() - session.lastActiveAt > timeoutMs;
    }
    getRecentTurns(sessionId, count) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return [];
        return session.turns.slice(-count);
    }
    deleteSession(sessionId) {
        return this.sessions.delete(sessionId);
    }
}

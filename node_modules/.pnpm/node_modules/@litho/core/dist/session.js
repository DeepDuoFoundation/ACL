export class Session {
    agents = new Map();
    updateAgent(state) {
        this.agents.set(state.agentId, state);
    }
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    getAllAgents() {
        return [...this.agents.values()];
    }
}
//# sourceMappingURL=session.js.map
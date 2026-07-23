export class DecisionLogger {
    decisions = [];
    async log(decision) {
        this.decisions.push(decision);
    }
    async getByAgent(agentId) {
        return this.decisions.filter((d) => d.agentId === agentId);
    }
    async getByStep(stepId) {
        return this.decisions.filter((d) => d.stepId === stepId);
    }
    async getRecent(count) {
        return this.decisions.slice(-count);
    }
    async getStats() {
        const total = this.decisions.length;
        const avgConf = total > 0
            ? this.decisions.reduce((sum, d) => sum + d.confidence, 0) / total
            : 0;
        return {
            totalDecisions: total,
            averageConfidence: avgConf,
            byMode: {},
        };
    }
    async clear() {
        this.decisions = [];
    }
}
//# sourceMappingURL=decision-logger.js.map
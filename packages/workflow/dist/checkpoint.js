export class CheckpointManager {
    checkpoints = new Map();
    async save(state) {
        const steps = Array.from(state.steps.values()).map((s) => ({
            id: s.id,
            status: s.status,
            result: s.result,
        }));
        const checkpoint = {
            workflowId: state.id,
            timestamp: Date.now(),
            steps,
        };
        const existing = this.checkpoints.get(state.id) ?? [];
        existing.push(checkpoint);
        this.checkpoints.set(state.id, existing);
    }
    async restore(workflowId) {
        const all = this.checkpoints.get(workflowId);
        if (!all || all.length === 0)
            return null;
        return all[all.length - 1];
    }
    async list(workflowId) {
        return this.checkpoints.get(workflowId) ?? [];
    }
    async clear(workflowId) {
        this.checkpoints.delete(workflowId);
    }
}
//# sourceMappingURL=checkpoint.js.map
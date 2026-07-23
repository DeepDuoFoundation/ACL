export class AgentLoop {
    registry;
    state;
    config;
    constructor(config, registry) {
        this.registry = registry;
        this.config = config;
        this.state = {
            agentId: config.agentId,
            status: "idle",
            currentIteration: 0,
        };
    }
    async run(input) {
        this.state.status = "running";
        const startTime = Date.now();
        try {
            const handler = this.registry.get(this.config.agentType);
            if (!handler) {
                throw new Error(`No handler for agent type: ${this.config.agentType}`);
            }
            let lastOutput = {};
            for (let i = 0; i < this.config.maxIterations; i++) {
                this.state.currentIteration = i + 1;
                lastOutput = await handler({ ...input, iteration: i, previousOutput: lastOutput });
                if ((lastOutput.confidence ?? 0) >= this.config.confidenceThreshold) {
                    break;
                }
            }
            this.state.status = "completed";
            return {
                agentId: this.config.agentId,
                status: "completed",
                output: { type: "correction", data: lastOutput, summary: "Done" },
                metadata: {
                    iteration: this.state.currentIteration,
                    confidence: lastOutput.confidence ?? 0,
                    kgEvidenceNodes: [],
                    runtimeMs: Date.now() - startTime,
                },
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.state.status = "failed";
            throw error;
        }
    }
    getState() {
        return { ...this.state };
    }
}
//# sourceMappingURL=agent-loop.js.map
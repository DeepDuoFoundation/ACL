export class BaseAgent {
    id;
    type;
    name;
    config;
    iteration = 0;
    constructor(id, type, name) {
        this.id = id;
        this.type = type;
        this.name = name;
    }
    async initialize(config) {
        this.config = config;
    }
    async run(input) {
        this.iteration = input.iteration;
        const startTime = Date.now();
        try {
            const result = await this.execute(input);
            return {
                agentId: this.id,
                status: "completed",
                output: {
                    type: this.getOutputType(),
                    data: result,
                    summary: this.getSummary(result),
                },
                metadata: this.buildMetadata(result, Date.now() - startTime),
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                agentId: this.id,
                status: "failed",
                output: {
                    type: this.getOutputType(),
                    data: { error: error.message },
                    summary: `Failed: ${error.message}`,
                },
                metadata: this.buildMetadata({}, Date.now() - startTime),
                timestamp: new Date(),
            };
        }
    }
    async checkpoint() {
        return {
            agentId: this.id,
            type: this.type,
            iteration: this.iteration,
            checkpointData: await this.getCheckpointData(),
            timestamp: new Date(),
        };
    }
    async restore(state) {
        await this.restoreFromCheckpoint(state.checkpointData);
    }
    async teardown() { }
    async getCheckpointData() {
        return {};
    }
    async restoreFromCheckpoint(data) { }
    buildMetadata(result, runtimeMs) {
        return {
            iteration: this.iteration,
            confidence: result.confidence ?? 0.5,
            kgEvidenceNodes: result.kgEvidenceNodes ?? [],
            runtimeMs,
        };
    }
}
//# sourceMappingURL=base-agent.js.map
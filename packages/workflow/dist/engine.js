import { DAG } from "./dag.js";
import { CheckpointManager } from "./checkpoint.js";
export class WorkflowEngine {
    config;
    dag;
    checkpointManager;
    handlers = new Map();
    state;
    constructor(config) {
        this.config = config;
        this.dag = new DAG();
        this.checkpointManager = new CheckpointManager();
        this.state = {
            id: "",
            name: "",
            steps: new Map(),
            status: "pending",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata: {},
        };
    }
    registerHandler(agentType, handler) {
        this.handlers.set(agentType, handler);
    }
    async createWorkflow(id, name, steps) {
        this.dag.fromSteps(steps);
        if (this.dag.isCyclic()) {
            throw new Error("Workflow contains cyclic dependencies");
        }
        this.state = {
            id,
            name,
            steps: new Map(steps.map((s) => [s.id, { ...s, status: "pending" }])),
            status: "pending",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata: {},
        };
    }
    async execute(initialData = {}) {
        this.state.status = "running";
        const inProgress = new Set();
        const completed = new Set();
        let context = { ...initialData };
        while (completed.size < this.state.steps.size) {
            const ready = this.dag.getReady(inProgress);
            if (ready.length === 0 && inProgress.size === 0) {
                this.state.status = "failed";
                throw new Error("Deadlock: no steps ready and none in progress");
            }
            const batch = ready.slice(0, this.config.maxParallelSteps);
            const promises = batch.map(async (stepId) => {
                const step = this.state.steps.get(stepId);
                inProgress.add(stepId);
                step.status = "running";
                step.startedAt = Date.now();
                try {
                    const handler = this.handlers.get(step.agentType ?? "default");
                    if (!handler)
                        throw new Error(`No handler for agent type: ${step.agentType}`);
                    const result = await handler(step, context);
                    step.result = result;
                    step.status = "completed";
                    step.completedAt = Date.now();
                    context = { ...context, [stepId]: result };
                }
                catch (err) {
                    step.error = err instanceof Error ? err.message : String(err);
                    step.status = "failed";
                    step.completedAt = Date.now();
                }
                finally {
                    inProgress.delete(stepId);
                    completed.add(stepId);
                    this.dag.complete(stepId);
                }
            });
            await Promise.all(promises);
            if (Date.now() - this.state.createdAt > this.config.timeoutMs) {
                this.state.status = "failed";
                throw new Error("Workflow timed out");
            }
            if (completed.size % this.config.checkpointInterval === 0) {
                await this.checkpointManager.save(this.state);
            }
        }
        this.state.status = "completed";
        this.state.updatedAt = Date.now();
        await this.checkpointManager.save(this.state);
        return this.state;
    }
    async pause() {
        this.state.status = "paused";
        await this.checkpointManager.save(this.state);
    }
    async resume() {
        const checkpoint = await this.checkpointManager.restore(this.state.id);
        if (checkpoint) {
            for (const step of checkpoint.steps) {
                const state = this.state.steps.get(step.id);
                if (state) {
                    state.status = step.status;
                    state.result = step.result;
                }
            }
        }
        this.state.status = "running";
        return this.execute();
    }
    getState() {
        return this.state;
    }
    getCheckpointManager() {
        return this.checkpointManager;
    }
}
//# sourceMappingURL=engine.js.map
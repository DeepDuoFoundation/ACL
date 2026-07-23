import type { WorkflowStep, WorkflowState, WorkflowConfig } from "./types.js";
import { CheckpointManager } from "./checkpoint.js";
export type StepHandler = (step: WorkflowStep, context: Record<string, unknown>) => Promise<Record<string, unknown>>;
export declare class WorkflowEngine {
    private config;
    private dag;
    private checkpointManager;
    private handlers;
    private state;
    constructor(config: WorkflowConfig);
    registerHandler(agentType: string, handler: StepHandler): void;
    createWorkflow(id: string, name: string, steps: WorkflowStep[]): Promise<void>;
    execute(initialData?: Record<string, unknown>): Promise<WorkflowState>;
    pause(): Promise<void>;
    resume(): Promise<WorkflowState>;
    getState(): WorkflowState;
    getCheckpointManager(): CheckpointManager;
}
//# sourceMappingURL=engine.d.ts.map
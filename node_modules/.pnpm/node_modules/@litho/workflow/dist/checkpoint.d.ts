import type { WorkflowState } from "./types.js";
export interface Checkpoint {
    workflowId: string;
    timestamp: number;
    steps: Array<{
        id: string;
        status: string;
        result?: Record<string, unknown>;
    }>;
}
export declare class CheckpointManager {
    private checkpoints;
    save(state: WorkflowState): Promise<void>;
    restore(workflowId: string): Promise<Checkpoint | null>;
    list(workflowId: string): Promise<Checkpoint[]>;
    clear(workflowId: string): Promise<void>;
}
//# sourceMappingURL=checkpoint.d.ts.map
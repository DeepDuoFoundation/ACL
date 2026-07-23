import type { WorkflowStep, WorkflowState } from "./types.js";

export interface Checkpoint {
  workflowId: string;
  timestamp: number;
  steps: Array<{ id: string; status: string; result?: Record<string, unknown> }>;
}

export class CheckpointManager {
  private checkpoints = new Map<string, Checkpoint[]>();

  async save(state: WorkflowState): Promise<void> {
    const steps = Array.from(state.steps.values()).map((s) => ({
      id: s.id,
      status: s.status,
      result: s.result,
    }));

    const checkpoint: Checkpoint = {
      workflowId: state.id,
      timestamp: Date.now(),
      steps,
    };

    const existing = this.checkpoints.get(state.id) ?? [];
    existing.push(checkpoint);
    this.checkpoints.set(state.id, existing);
  }

  async restore(workflowId: string): Promise<Checkpoint | null> {
    const all = this.checkpoints.get(workflowId);
    if (!all || all.length === 0) return null;
    return all[all.length - 1];
  }

  async list(workflowId: string): Promise<Checkpoint[]> {
    return this.checkpoints.get(workflowId) ?? [];
  }

  async clear(workflowId: string): Promise<void> {
    this.checkpoints.delete(workflowId);
  }
}

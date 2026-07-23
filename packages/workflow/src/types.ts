export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "waiting_human";

export interface WorkflowStep {
  id: string;
  name: string;
  agentType?: string;
  dependencies: string[];
  config: Record<string, unknown>;
  status: StepStatus;
  result?: Record<string, unknown>;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface WorkflowState {
  id: string;
  name: string;
  steps: Map<string, WorkflowStep>;
  status: "pending" | "running" | "completed" | "failed" | "paused";
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, unknown>;
}

export interface WorkflowConfig {
  maxParallelSteps: number;
  checkpointInterval: number;
  timeoutMs: number;
  enableHITL: boolean;
}

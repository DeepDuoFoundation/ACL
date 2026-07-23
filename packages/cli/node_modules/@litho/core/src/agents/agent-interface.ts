import type { AgentConfig, AgentResponse } from "@litho/shared";

export interface SwarmAgent {
  readonly id: string;
  readonly type: AgentType;
  readonly name: string;

  initialize(config: AgentConfig): Promise<void>;
  run(input: AgentInput): Promise<AgentResponse>;
  checkpoint(): Promise<AgentState>;
  restore(state: AgentState): Promise<void>;
  teardown(): Promise<void>;
}

export type AgentType =
  | "layout_understanding"
  | "physics_modeling"
  | "opc_mask_optimisation"
  | "fourier_lithography"
  | "pino_inverse"
  | "rl_policy"
  | "verification"
  | "conflict_resolution"
  | "autonomous_decision"
  | "moe_router";

export interface AgentInput {
  jobId: string;
  iteration: number;
  data: Record<string, unknown>;
  previousOutput?: Record<string, unknown>;
}

export interface AgentState {
  agentId: string;
  type: AgentType;
  iteration: number;
  checkpointData: Record<string, unknown>;
  timestamp: Date;
}

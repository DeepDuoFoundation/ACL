export type AgentStatus = "idle" | "running" | "completed" | "failed" | "awaiting_approval";

export interface AgentResponse {
  agentId: string;
  status: AgentStatus;
  output: AgentOutput;
  metadata: AgentMetadata;
  timestamp: Date;
}

export interface AgentOutput {
  type: "correction" | "analysis" | "recommendation" | "report";
  data: Record<string, unknown>;
  summary: string;
}

export interface AgentMetadata {
  iteration: number;
  confidence: number;
  kgEvidenceNodes: string[];
  digitalTwinValidation?: boolean;
  runtimeMs: number;
}

export interface AgentConfig {
  agentId: string;
  agentType: string;
  maxIterations: number;
  confidenceThreshold: number;
  checkpointInterval: number;
}

export interface AgentState {
  agentId: string;
  status: AgentStatus;
  currentIteration: number;
  checkpoint?: Record<string, unknown>;
}

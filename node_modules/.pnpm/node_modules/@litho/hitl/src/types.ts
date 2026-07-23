export type HITLMode = "autonomous" | "advisory" | "gatekeeper" | "manual";

export interface HumanDecision {
  id: string;
  agentId: string;
  stepId: string;
  decision: string;
  confidence: number;
  reason: string;
  alternatives?: string[];
  timestamp: number;
}

export interface ApprovalRequest {
  id: string;
  stepId: string;
  agentId: string;
  proposal: Record<string, unknown>;
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredApprovals: number;
  currentApprovals: number;
  status: "pending" | "approved" | "rejected" | "escalated";
  createdAt: number;
  resolvedAt?: number;
  approvers: string[];
}

export interface HITLConfig {
  mode: HITLMode;
  timeoutMs: number;
  maxEscalationLevel: number;
  autoApproveThreshold: number;
}

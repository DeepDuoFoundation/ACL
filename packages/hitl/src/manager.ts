import type { HITLMode, HITLConfig, HumanDecision, ApprovalRequest } from "./types.js";
import { DecisionLogger } from "./decision-logger.js";
import { ApprovalWorkflow } from "./approval.js";

export class HITLManager {
  private config: HITLConfig;
  private decisionLogger: DecisionLogger;
  private approvalWorkflow: ApprovalWorkflow;

  constructor(config: HITLConfig) {
    this.config = config;
    this.decisionLogger = new DecisionLogger();
    this.approvalWorkflow = new ApprovalWorkflow();
  }

  getMode(): HITLMode {
    return this.config.mode;
  }

  setMode(mode: HITLMode): void {
    this.config.mode = mode;
  }

  async requiresApproval(stepId: string, agentId: string, riskLevel: ApprovalRequest["riskLevel"]): Promise<boolean> {
    switch (this.config.mode) {
      case "autonomous":
        return false;
      case "advisory":
        return riskLevel === "critical";
      case "gatekeeper":
        return riskLevel !== "low";
      case "manual":
        return true;
      default:
        return false;
    }
  }

  async requestApproval(stepId: string, agentId: string, proposal: Record<string, unknown>, riskLevel: ApprovalRequest["riskLevel"]): Promise<ApprovalRequest> {
    const requiredApprovals = riskLevel === "critical" ? 2 : 1;
    return this.approvalWorkflow.createRequest({
      id: `approval-${Date.now()}`,
      stepId,
      agentId,
      proposal,
      riskLevel,
      requiredApprovals,
      createdAt: Date.now(),
    });
  }

  async logDecision(decision: HumanDecision): Promise<void> {
    await this.decisionLogger.log(decision);
  }

  async getDecisionHistory(agentId?: string): Promise<HumanDecision[]> {
    if (agentId) {
      return this.decisionLogger.getByAgent(agentId);
    }
    return this.decisionLogger.getRecent(100);
  }

  async approveRequest(requestId: string, approver: string): Promise<ApprovalRequest> {
    return this.approvalWorkflow.approve(requestId, approver);
  }

  async rejectRequest(requestId: string, approver: string): Promise<ApprovalRequest> {
    return this.approvalWorkflow.reject(requestId, approver, "Rejected by approver");
  }

  async escalateRequest(requestId: string): Promise<ApprovalRequest> {
    return this.approvalWorkflow.escalate(requestId);
  }

  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    return this.approvalWorkflow.getPending();
  }

  async getStats(): Promise<{
    totalDecisions: number;
    averageConfidence: number;
    pendingApprovals: number;
    mode: HITLMode;
  }> {
    const decisionStats = await this.decisionLogger.getStats();
    const pending = await this.approvalWorkflow.getPending();

    return {
      ...decisionStats,
      pendingApprovals: pending.length,
      mode: this.config.mode,
    };
  }
}

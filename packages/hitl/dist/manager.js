import { DecisionLogger } from "./decision-logger.js";
import { ApprovalWorkflow } from "./approval.js";
export class HITLManager {
    config;
    decisionLogger;
    approvalWorkflow;
    constructor(config) {
        this.config = config;
        this.decisionLogger = new DecisionLogger();
        this.approvalWorkflow = new ApprovalWorkflow();
    }
    getMode() {
        return this.config.mode;
    }
    setMode(mode) {
        this.config.mode = mode;
    }
    async requiresApproval(stepId, agentId, riskLevel) {
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
    async requestApproval(stepId, agentId, proposal, riskLevel) {
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
    async logDecision(decision) {
        await this.decisionLogger.log(decision);
    }
    async getDecisionHistory(agentId) {
        if (agentId) {
            return this.decisionLogger.getByAgent(agentId);
        }
        return this.decisionLogger.getRecent(100);
    }
    async approveRequest(requestId, approver) {
        return this.approvalWorkflow.approve(requestId, approver);
    }
    async rejectRequest(requestId, approver) {
        return this.approvalWorkflow.reject(requestId, approver, "Rejected by approver");
    }
    async escalateRequest(requestId) {
        return this.approvalWorkflow.escalate(requestId);
    }
    async getPendingApprovals() {
        return this.approvalWorkflow.getPending();
    }
    async getStats() {
        const decisionStats = await this.decisionLogger.getStats();
        const pending = await this.approvalWorkflow.getPending();
        return {
            ...decisionStats,
            pendingApprovals: pending.length,
            mode: this.config.mode,
        };
    }
}
//# sourceMappingURL=manager.js.map
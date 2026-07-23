import type { HITLMode, HITLConfig, HumanDecision, ApprovalRequest } from "./types.js";
export declare class HITLManager {
    private config;
    private decisionLogger;
    private approvalWorkflow;
    constructor(config: HITLConfig);
    getMode(): HITLMode;
    setMode(mode: HITLMode): void;
    requiresApproval(stepId: string, agentId: string, riskLevel: ApprovalRequest["riskLevel"]): Promise<boolean>;
    requestApproval(stepId: string, agentId: string, proposal: Record<string, unknown>, riskLevel: ApprovalRequest["riskLevel"]): Promise<ApprovalRequest>;
    logDecision(decision: HumanDecision): Promise<void>;
    getDecisionHistory(agentId?: string): Promise<HumanDecision[]>;
    approveRequest(requestId: string, approver: string): Promise<ApprovalRequest>;
    rejectRequest(requestId: string, approver: string): Promise<ApprovalRequest>;
    escalateRequest(requestId: string): Promise<ApprovalRequest>;
    getPendingApprovals(): Promise<ApprovalRequest[]>;
    getStats(): Promise<{
        totalDecisions: number;
        averageConfidence: number;
        pendingApprovals: number;
        mode: HITLMode;
    }>;
}
//# sourceMappingURL=manager.d.ts.map
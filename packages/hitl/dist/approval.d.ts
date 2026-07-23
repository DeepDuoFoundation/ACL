import type { ApprovalRequest } from "./types.js";
export declare class ApprovalWorkflow {
    private requests;
    createRequest(request: Omit<ApprovalRequest, "status" | "currentApprovals" | "approvers">): Promise<ApprovalRequest>;
    approve(requestId: string, approver: string): Promise<ApprovalRequest>;
    reject(requestId: string, approver: string, reason: string): Promise<ApprovalRequest>;
    escalate(requestId: string): Promise<ApprovalRequest>;
    getPending(): Promise<ApprovalRequest[]>;
    getById(requestId: string): Promise<ApprovalRequest | undefined>;
}
//# sourceMappingURL=approval.d.ts.map
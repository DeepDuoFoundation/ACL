import type { ApprovalRequest } from "./types.js";

export class ApprovalWorkflow {
  private requests = new Map<string, ApprovalRequest>();

  async createRequest(request: Omit<ApprovalRequest, "status" | "currentApprovals" | "approvers">): Promise<ApprovalRequest> {
    const fullRequest: ApprovalRequest = {
      ...request,
      status: "pending",
      currentApprovals: 0,
      approvers: [],
    };
    this.requests.set(fullRequest.id, fullRequest);
    return fullRequest;
  }

  async approve(requestId: string, approver: string): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    request.currentApprovals++;
    request.approvers.push(approver);

    if (request.currentApprovals >= request.requiredApprovals) {
      request.status = "approved";
      request.resolvedAt = Date.now();
    }

    return request;
  }

  async reject(requestId: string, approver: string, reason: string): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    request.status = "rejected";
    request.resolvedAt = Date.now();
    return request;
  }

  async escalate(requestId: string): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    request.status = "escalated";
    return request;
  }

  async getPending(): Promise<ApprovalRequest[]> {
    return Array.from(this.requests.values()).filter((r) => r.status === "pending");
  }

  async getById(requestId: string): Promise<ApprovalRequest | undefined> {
    return this.requests.get(requestId);
  }
}

export class ApprovalWorkflow {
    requests = new Map();
    async createRequest(request) {
        const fullRequest = {
            ...request,
            status: "pending",
            currentApprovals: 0,
            approvers: [],
        };
        this.requests.set(fullRequest.id, fullRequest);
        return fullRequest;
    }
    async approve(requestId, approver) {
        const request = this.requests.get(requestId);
        if (!request)
            throw new Error(`Request not found: ${requestId}`);
        request.currentApprovals++;
        request.approvers.push(approver);
        if (request.currentApprovals >= request.requiredApprovals) {
            request.status = "approved";
            request.resolvedAt = Date.now();
        }
        return request;
    }
    async reject(requestId, approver, reason) {
        const request = this.requests.get(requestId);
        if (!request)
            throw new Error(`Request not found: ${requestId}`);
        request.status = "rejected";
        request.resolvedAt = Date.now();
        return request;
    }
    async escalate(requestId) {
        const request = this.requests.get(requestId);
        if (!request)
            throw new Error(`Request not found: ${requestId}`);
        request.status = "escalated";
        return request;
    }
    async getPending() {
        return Array.from(this.requests.values()).filter((r) => r.status === "pending");
    }
    async getById(requestId) {
        return this.requests.get(requestId);
    }
}
//# sourceMappingURL=approval.js.map
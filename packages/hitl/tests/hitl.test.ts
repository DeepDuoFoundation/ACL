import { describe, it, expect } from "vitest";
import { HITLManager } from "../src/manager.js";
import { DecisionLogger } from "../src/decision-logger.js";
import { ApprovalWorkflow } from "../src/approval.js";
import type { HITLConfig, HumanDecision } from "../src/types.js";

const testConfig: HITLConfig = {
  mode: "gatekeeper",
  timeoutMs: 30000,
  maxEscalationLevel: 3,
  autoApproveThreshold: 0.95,
};

describe("DecisionLogger", () => {
  it("should log decisions", async () => {
    const logger = new DecisionLogger();
    const decision: HumanDecision = {
      id: "dec-1",
      agentId: "agent-1",
      stepId: "step-1",
      decision: "approve",
      confidence: 0.9,
      reason: "Within spec",
      timestamp: Date.now(),
    };

    await logger.log(decision);
    const stats = await logger.getStats();
    expect(stats.totalDecisions).toBe(1);
    expect(stats.averageConfidence).toBe(0.9);
  });

  it("should filter by agent", async () => {
    const logger = new DecisionLogger();
    await logger.log({ id: "1", agentId: "a", stepId: "s", decision: "y", confidence: 0.9, reason: "r", timestamp: Date.now() });
    await logger.log({ id: "2", agentId: "b", stepId: "s", decision: "y", confidence: 0.8, reason: "r", timestamp: Date.now() });

    const aDecisions = await logger.getByAgent("a");
    expect(aDecisions.length).toBe(1);
  });
});

describe("ApprovalWorkflow", () => {
  it("should create and approve request", async () => {
    const workflow = new ApprovalWorkflow();
    const request = await workflow.createRequest({
      id: "req-1",
      stepId: "step-1",
      agentId: "agent-1",
      proposal: { action: "release" },
      riskLevel: "medium",
      requiredApprovals: 1,
      createdAt: Date.now(),
    });

    expect(request.status).toBe("pending");

    const approved = await workflow.approve("req-1", "engineer-1");
    expect(approved.status).toBe("approved");
    expect(approved.currentApprovals).toBe(1);
  });

  it("should reject request", async () => {
    const workflow = new ApprovalWorkflow();
    await workflow.createRequest({
      id: "req-2",
      stepId: "step-1",
      agentId: "agent-1",
      proposal: {},
      riskLevel: "high",
      requiredApprovals: 1,
      createdAt: Date.now(),
    });

    const rejected = await workflow.reject("req-2", "engineer-1");
    expect(rejected.status).toBe("rejected");
  });
});

describe("HITLManager", () => {
  it("should not require approval in autonomous mode", async () => {
    const manager = new HITLManager({ ...testConfig, mode: "autonomous" });
    const requires = await manager.requiresApproval("step-1", "agent-1", "high");
    expect(requires).toBe(false);
  });

  it("should require approval in manual mode", async () => {
    const manager = new HITLManager({ ...testConfig, mode: "manual" });
    const requires = await manager.requiresApproval("step-1", "agent-1", "low");
    expect(requires).toBe(true);
  });

  it("should require approval for critical in advisory mode", async () => {
    const manager = new HITLManager({ ...testConfig, mode: "advisory" });
    const lowRequires = await manager.requiresApproval("step-1", "agent-1", "low");
    const critRequires = await manager.requiresApproval("step-1", "agent-1", "critical");
    expect(lowRequires).toBe(false);
    expect(critRequires).toBe(true);
  });

  it("should log decisions and get stats", async () => {
    const manager = new HITLManager(testConfig);
    await manager.logDecision({
      id: "dec-1",
      agentId: "agent-1",
      stepId: "step-1",
      decision: "approve",
      confidence: 0.9,
      reason: "OK",
      timestamp: Date.now(),
    });

    const stats = await manager.getStats();
    expect(stats.totalDecisions).toBe(1);
    expect(stats.mode).toBe("gatekeeper");
  });

  it("should manage approval workflow", async () => {
    const manager = new HITLManager(testConfig);
    const request = await manager.requestApproval("step-1", "agent-1", { action: "release" }, "high");
    expect(request.status).toBe("pending");

    const approved = await manager.approveRequest(request.id, "engineer-1");
    expect(approved.status).toBe("approved");
  });

  it("should escalate request", async () => {
    const manager = new HITLManager(testConfig);
    const request = await manager.requestApproval("step-1", "agent-1", {}, "critical");
    const escalated = await manager.escalateRequest(request.id);
    expect(escalated.status).toBe("escalated");
  });
});

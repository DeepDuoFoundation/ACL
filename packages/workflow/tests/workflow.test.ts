import { describe, it, expect } from "vitest";
import { WorkflowEngine, type StepHandler } from "../src/engine.js";
import { DAG } from "../src/dag.js";
import { CheckpointManager } from "../src/checkpoint.js";
import type { WorkflowStep, WorkflowConfig } from "../src/types.js";

const testConfig: WorkflowConfig = {
  maxParallelSteps: 3,
  checkpointInterval: 2,
  timeoutMs: 30000,
  enableHITL: false,
};

describe("DAG", () => {
  it("should detect cyclic dependencies", () => {
    const dag = new DAG();
    dag.addEdge("a", "b");
    dag.addEdge("b", "c");
    dag.addEdge("c", "a");
    expect(dag.isCyclic()).toBe(true);
  });

  it("should return ready nodes", () => {
    const dag = new DAG();
    dag.addEdge("a", "b");
    dag.addEdge("a", "c");
    const ready = dag.getReady(new Set());
    expect(ready).toContain("a");
    expect(ready.length).toBe(1);
  });

  it("should topological sort", () => {
    const dag = new DAG();
    dag.addEdge("a", "b");
    dag.addEdge("b", "c");
    const sorted = dag.topologicalSort();
    expect(sorted.indexOf("a")).toBeLessThan(sorted.indexOf("b"));
    expect(sorted.indexOf("b")).toBeLessThan(sorted.indexOf("c"));
  });
});

describe("CheckpointManager", () => {
  it("should save and restore checkpoints", async () => {
    const manager = new CheckpointManager();
    const state = {
      id: "wf-1",
      name: "test",
      steps: new Map([["step-1", { id: "step-1", name: "test", dependencies: [], config: {}, status: "completed" as const }]]),
      status: "completed" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
    };

    await manager.save(state);
    const restored = await manager.restore("wf-1");
    expect(restored).not.toBeNull();
    expect(restored!.steps.length).toBe(1);
  });
});

describe("WorkflowEngine", () => {
  it("should execute linear workflow", async () => {
    const engine = new WorkflowEngine(testConfig);
    const steps: WorkflowStep[] = [
      { id: "step-1", name: "Step 1", agentType: "test", dependencies: [], config: {}, status: "pending" },
      { id: "step-2", name: "Step 2", agentType: "test", dependencies: ["step-1"], config: {}, status: "pending" },
    ];

    const handler: StepHandler = async (step) => ({ done: true, stepId: step.id });
    engine.registerHandler("test", handler);

    await engine.createWorkflow("wf-1", "test", steps);
    const result = await engine.execute({});

    expect(result.status).toBe("completed");
    expect(result.steps.get("step-1")?.status).toBe("completed");
    expect(result.steps.get("step-2")?.status).toBe("completed");
  });

  it("should execute parallel steps", async () => {
    const engine = new WorkflowEngine(testConfig);
    const steps: WorkflowStep[] = [
      { id: "a", name: "A", agentType: "test", dependencies: [], config: {}, status: "pending" },
      { id: "b", name: "B", agentType: "test", dependencies: [], config: {}, status: "pending" },
      { id: "c", name: "C", agentType: "test", dependencies: ["a", "b"], config: {}, status: "pending" },
    ];

    const handler: StepHandler = async (step) => ({ stepId: step.id });
    engine.registerHandler("test", handler);

    await engine.createWorkflow("wf-2", "parallel", steps);
    const result = await engine.execute();

    expect(result.steps.get("a")?.status).toBe("completed");
    expect(result.steps.get("b")?.status).toBe("completed");
    expect(result.steps.get("c")?.status).toBe("completed");
  });

  it("should detect cycles", async () => {
    const engine = new WorkflowEngine(testConfig);
    const steps: WorkflowStep[] = [
      { id: "a", name: "A", dependencies: ["b"], config: {}, status: "pending" },
      { id: "b", name: "B", dependencies: ["a"], config: {}, status: "pending" },
    ];

    await expect(engine.createWorkflow("wf-3", "cyclic", steps)).rejects.toThrow("cyclic");
  });
});

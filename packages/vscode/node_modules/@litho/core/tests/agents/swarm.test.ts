import { describe, it, expect } from "vitest";
import { AgentSwarm } from "../../src/agents/index.js";
import type { AgentType } from "../../src/agents/agent-interface.js";

describe("AgentSwarm", () => {
  it("should register all 10 default agents", () => {
    const swarm = new AgentSwarm();
    const agents = ["layout-1", "moe-1", "physics-1", "fourier-1", "pino-1", "opc-1", "rl-1", "verify-1", "conflict-1", "decision-1"];
    for (const id of agents) {
      expect(swarm.get(id)).toBeDefined();
    }
  });

  it("should get agents by type", () => {
    const swarm = new AgentSwarm();
    const layoutAgents = swarm.getByType("layout_understanding");
    expect(layoutAgents.length).toBe(1);
    expect(layoutAgents[0].type).toBe("layout_understanding");
  });

  it("should execute pipeline in order", async () => {
    const swarm = new AgentSwarm();
    const responses = await swarm.executePipeline("job-1", {
      layout: { layers: new Map(), boundingBox: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 } },
    });

    expect(responses.length).toBe(10);
    expect(responses[0].agentId).toBe("layout-1");
    expect(responses[9].agentId).toBe("decision-1");
  });

  it("should run individual agent", async () => {
    const swarm = new AgentSwarm();
    const agent = swarm.get("physics-1")!;
    const response = await agent.run({
      jobId: "job-1",
      iteration: 0,
      data: { maskData: {}, illumination: { na: 0.55 } },
    });

    expect(response.status).toBe("completed");
    expect(response.output.data.fidelity).toBeDefined();
  });

  it("should checkpoint all agents", async () => {
    const swarm = new AgentSwarm();
    const checkpoints = await swarm.checkpointAll();
    expect(checkpoints.length).toBe(10);
    expect(checkpoints[0].agentId).toBeDefined();
  });
});

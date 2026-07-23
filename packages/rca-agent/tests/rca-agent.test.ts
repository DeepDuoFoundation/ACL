import { describe, it, expect } from "vitest";
import { RCAAgent } from "../src/agent.js";
import { CausalGraph } from "../src/causal-graph.js";
import { HypothesisGenerator } from "../src/hypothesis.js";
import type { Symptom, RCAConfig } from "../src/types.js";

const testConfig: RCAConfig = {
  maxHypotheses: 5,
  minProbability: 0.2,
  enableDigitalTwinValidation: true,
  kgTraversalDepth: 3,
};

const testSymptom: Symptom = {
  id: "sym-1",
  type: "epe_violation",
  severity: "high",
  layer: "M1",
  location: { x: 100, y: 100, width: 500, height: 500 },
  metrics: { epeMax: 2.5, epeAvg: 1.8 },
  timestamp: Date.now(),
  description: "EPE violation on Metal Layer 1 in dense region",
};

describe("CausalGraph", () => {
  it("should add and traverse nodes", () => {
    const graph = new CausalGraph();
    graph.addNode({ id: "n1", type: "layer", properties: { name: "M1" }, connections: ["n2"] });
    graph.addNode({ id: "n2", type: "process", properties: { name: "etch" }, connections: [] });

    const result = graph.traverse("n1", 2);
    expect(result.length).toBe(2);
  });

  it("should find related nodes by symptom", () => {
    const graph = new CausalGraph();
    graph.addNode({ id: "n1", type: "layer", properties: { name: "M1" }, connections: [] });

    const related = graph.findRelatedNodes(testSymptom);
    expect(related.length).toBe(1);
  });
});

describe("HypothesisGenerator", () => {
  it("should generate hypotheses for EPE violation", async () => {
    const generator = new HypothesisGenerator(testConfig);
    const hypotheses = await generator.generate(testSymptom, ["kg-1"]);

    expect(hypotheses.length).toBeGreaterThan(0);
    expect(hypotheses[0].probability).toBeGreaterThan(0);
  });

  it("should filter by min probability", async () => {
    const generator = new HypothesisGenerator({ ...testConfig, minProbability: 0.5 });
    const hypotheses = await generator.generate(testSymptom, []);

    for (const hyp of hypotheses) {
      expect(hyp.probability).toBeGreaterThanOrEqual(0.5);
    }
  });

  it("should limit by max hypotheses", async () => {
    const generator = new HypothesisGenerator({ ...testConfig, maxHypotheses: 2 });
    const hypotheses = await generator.generate(testSymptom, []);

    expect(hypotheses.length).toBeLessThanOrEqual(2);
  });
});

describe("RCAAgent", () => {
  it("should investigate symptom and return result", async () => {
    const agent = new RCAAgent(testConfig);
    const result = await agent.investigate(testSymptom);

    expect(result.id).toBeDefined();
    expect(result.symptom.id).toBe("sym-1");
    expect(result.causalChain.hypotheses.length).toBeGreaterThan(0);
    expect(result.turnaroundTime).toBeGreaterThanOrEqual(0);
  });

  it("should generate fix recommendations", async () => {
    const agent = new RCAAgent(testConfig);
    const result = await agent.investigate(testSymptom);

    expect(result.causalChain.fixRecommendations.length).toBeGreaterThan(0);
    expect(result.causalChain.fixRecommendations[0].action).toBeDefined();
  });

  it("should reference KG nodes", async () => {
    const agent = new RCAAgent(testConfig);
    const result = await agent.investigate(testSymptom);

    expect(result.kgNodesReferenced).toBeDefined();
  });

  it("should validate with digital twin", async () => {
    const agent = new RCAAgent(testConfig);
    const result = await agent.investigate(testSymptom);

    expect(result.causalChain.digitalTwinValidation).toBe(true);
    expect(result.causalChain.validatedHypothesis).toBeDefined();
  });
});

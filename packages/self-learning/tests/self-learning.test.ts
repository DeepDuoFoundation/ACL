import { describe, it, expect } from "vitest";
import { SelfLearningAgent } from "../src/agent.js";
import { EWCCalculator } from "../src/ewc.js";
import { ExperienceReplay } from "../src/replay.js";
import type { SelfLearningConfig, TapeOutData } from "../src/types.js";

const testConfig: SelfLearningConfig = {
  ewcLambda: 0.4,
  replayBufferSize: 1000,
  benchmarkThreshold: 0.95,
  enableRLHF: true,
};

const testTapeOut: TapeOutData = {
  id: "tapeout-1",
  designId: "design-sram-n3e",
  pdk: "TSMC N3E",
  layer: "M1",
  maskQuality: 0.92,
  yieldOutcome: 0.95,
  correctionTrajectory: [
    { iteration: 0, epe: 2.0, reward: 0.3 },
    { iteration: 1, epe: 1.5, reward: 0.5 },
    { iteration: 2, epe: 1.0, reward: 0.7 },
    { iteration: 3, epe: 0.8, reward: 0.9 },
  ],
  engineerOverrides: [
    { stepId: "step-1", originalDecision: "auto", overrideDecision: "manual_adjust" },
  ],
  timestamp: Date.now(),
};

describe("EWCCalculator", () => {
  it("should compute fisher information", () => {
    const ewc = new EWCCalculator(0.4);
    const data = [[0.5, 0.3], [0.7, 0.2]];
    const info = ewc.computeFisherInformation("model-1", data);

    expect(info.weights.size).toBe(4);
    expect(info.timestamp).toBeGreaterThan(0);
  });

  it("should compute penalty", () => {
    const ewc = new EWCCalculator(0.4);
    ewc.computeFisherInformation("model-1", [[0.5, 0.3]]);

    const weights = new Map([["0-0", 0.1], ["0-1", 0.2]]);
    const penalty = ewc.computePenalty("model-1", weights);

    expect(penalty).toBeGreaterThan(0);
  });
});

describe("ExperienceReplay", () => {
  it("should add and sample experiences", () => {
    const replay = new ExperienceReplay(100);
    replay.add({ id: "1", data: { a: 1 }, reward: 0.5, timestamp: Date.now() });
    replay.add({ id: "2", data: { a: 2 }, reward: 0.8, timestamp: Date.now() });

    const sampled = replay.sample(2);
    expect(sampled.length).toBe(2);
  });

  it("should get high reward experiences", () => {
    const replay = new ExperienceReplay(100);
    replay.add({ id: "1", data: {}, reward: 0.3, timestamp: Date.now() });
    replay.add({ id: "2", data: {}, reward: 0.9, timestamp: Date.now() });
    replay.add({ id: "3", data: {}, reward: 0.7, timestamp: Date.now() });

    const highReward = replay.getHighReward(2);
    expect(highReward[0].reward).toBe(0.9);
    expect(highReward[1].reward).toBe(0.7);
  });

  it("should respect max size", () => {
    const replay = new ExperienceReplay(2);
    replay.add({ id: "1", data: {}, reward: 0.5, timestamp: Date.now() });
    replay.add({ id: "2", data: {}, reward: 0.5, timestamp: Date.now() });
    replay.add({ id: "3", data: {}, reward: 0.5, timestamp: Date.now() });

    expect(replay.size()).toBe(2);
  });
});

describe("SelfLearningAgent", () => {
  it("should analyse tape-out and generate updates", async () => {
    const agent = new SelfLearningAgent(testConfig);
    const updates = await agent.analyseTapeOut(testTapeOut);

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0].modelType).toBeDefined();
  });

  it("should update RL policy with RLHF", async () => {
    const agent = new SelfLearningAgent(testConfig);
    const updates = await agent.analyseTapeOut(testTapeOut);

    const rlUpdate = updates.find((u) => u.modelType === "rl_policy");
    expect(rlUpdate).toBeDefined();
    expect(rlUpdate!.updateData.tapeOutId).toBe("tapeout-1");
  });

  it("should update KG recipe library", async () => {
    const agent = new SelfLearningAgent(testConfig);
    const updates = await agent.analyseTapeOut(testTapeOut);

    const kgUpdate = updates.find((u) => u.modelType === "kg_recipe");
    expect(kgUpdate).toBeDefined();
    expect(kgUpdate!.promoted).toBe(true);
  });

  it("should populate replay buffer", async () => {
    const agent = new SelfLearningAgent(testConfig);
    await agent.analyseTapeOut(testTapeOut);

    const buffer = agent.getReplayBuffer();
    expect(buffer.size()).toBeGreaterThan(0);
  });

  it("should track promoted updates", async () => {
    const agent = new SelfLearningAgent(testConfig);
    await agent.analyseTapeOut(testTapeOut);

    const promoted = agent.getPromotedUpdates();
    expect(promoted.length).toBeGreaterThan(0);
  });
});

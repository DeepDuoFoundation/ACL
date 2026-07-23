import { describe, it, expect } from "vitest";
import { NLIV3Engine } from "../src/engine.js";
import { ConversationManager } from "../src/conversation.js";
import { ClarificationEngine } from "../src/clarification.js";

describe("NLIV3Engine", () => {
  it("should process a simple OPC command", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Run opc for Metal1");
    expect(response.intent).toBe("run_opc");
    expect(response.slots.layer).toBe("Metal1");
    expect(response.needsClarification).toBe(false);
    expect(response.message).toContain("OPC correction");
  });

  it("should request clarification when layer is missing", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Run opc");
    expect(response.needsClarification).toBe(true);
    expect(response.clarificationQuestions.length).toBeGreaterThan(0);
    expect(response.clarificationQuestions[0].slotName).toBe("layer");
  });

  it("should accumulate slots across turns", async () => {
    const engine = new NLIV3Engine();
    await engine.processMessage("s1", "user1", "Run opc");
    const response = await engine.processClarification("s1", "layer", "Metal1");
    expect(response.needsClarification).toBe(false);
    expect(response.slots.layer).toBe("Metal1");
  });

  it("should maintain conversation context across multiple turns", async () => {
    const engine = new NLIV3Engine();
    await engine.processMessage("s1", "user1", "Run opc for Metal1");
    const response = await engine.processMessage("s1", "user1", "Run opc for Metal2");
    expect(response.slots.layer).toBe("Metal2");
    expect(response.message).toContain("building on our conversation");
  });

  it("should classify twin_simulate intent", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "What if I increase dose by 3%?");
    expect(response.intent).toBe("twin_simulate");
    expect(response.slots.parameter).toBe("dose");
  });

  it("should classify RCA intent", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Investigate failure for Gate layer");
    expect(response.intent).toBe("rca_investigate");
    expect(response.slots.layer).toBe("Gate");
  });

  it("should classify compare_runs intent", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Compare these two runs");
    expect(response.intent).toBe("compare_runs");
  });

  it("should handle set_pdk intent with clarification", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Load pdk");
    expect(response.needsClarification).toBe(true);
    expect(response.clarificationQuestions[0].slotName).toBe("pdk_name");
  });

  it("should return session ID in response", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("test-session", "user1", "Analyze layout for Metal1");
    expect(response.sessionId).toBe("test-session");
  });
});

describe("ConversationManager", () => {
  it("should create and retrieve sessions", () => {
    const mgr = new ConversationManager();
    const session = mgr.createSession("s1", "user1");
    expect(session.id).toBe("s1");
    expect(mgr.getSession("s1")).toBeDefined();
  });

  it("should merge slots across turns", () => {
    const mgr = new ConversationManager();
    mgr.createSession("s1", "user1");
    mgr.mergeSlots("s1", { layer: "Metal1" });
    mgr.mergeSlots("s1", { pdk_name: "tsmc-n3e" });
    expect(mgr.getSlot("s1", "layer")).toBe("Metal1");
    expect(mgr.getSlot("s1", "pdk_name")).toBe("tsmc-n3e");
  });

  it("should detect expired sessions", () => {
    const mgr = new ConversationManager();
    mgr.createSession("s1", "user1");
    expect(mgr.isExpired("s1", 1000)).toBe(false);
    expect(mgr.isExpired("nonexistent", 1000)).toBe(true);
  });
});

describe("ClarificationEngine", () => {
  it("should find missing required slots", () => {
    const engine = new ClarificationEngine();
    const missing = engine.findMissingSlots("run_opc", {});
    expect(missing).toContain("layer");
  });

  it("should not report missing slots when all are present", () => {
    const engine = new ClarificationEngine();
    const missing = engine.findMissingSlots("run_opc", { layer: "Metal1" });
    expect(missing).toHaveLength(0);
  });

  it("should generate clarification questions", () => {
    const engine = new ClarificationEngine();
    const questions = engine.generateQuestions("run_opc", {});
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].required).toBe(true);
  });

  it("should determine when clarification is needed", () => {
    const engine = new ClarificationEngine();
    expect(engine.needsClarification(0.5, [])).toBe(true);
    expect(engine.needsClarification(0.9, [])).toBe(false);
    expect(engine.needsClarification(0.9, ["layer"])).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { NLIV2Engine } from "../src/engine.js";
import { ContextManager } from "../src/context.js";
import { ResponseGenerator } from "../src/response.js";
import type { NLIConfig, UserIntent } from "../src/types.js";

const testConfig: NLIConfig = {
  maxContextLength: 1000,
  confidenceThreshold: 0.5,
  enableMultiTurn: true,
  supportedIntents: [],
};

describe("ContextManager", () => {
  it("should create conversation state", () => {
    const manager = new ContextManager();
    const state = manager.getOrCreate("session-1", "user-1");

    expect(state.sessionId).toBe("session-1");
    expect(state.userId).toBe("user-1");
    expect(state.turnCount).toBe(0);
  });

  it("should add to history", () => {
    const manager = new ContextManager();
    const state = manager.getOrCreate("session-1", "user-1");
    manager.addToHistory(state, "user", "Hello");

    expect(state.history.length).toBe(1);
    expect(state.turnCount).toBe(1);
  });

  it("should set and get context", () => {
    const manager = new ContextManager();
    const state = manager.getOrCreate("session-1", "user-1");
    manager.setContext(state, "pdk", "TSMC N3E");

    expect(manager.getContext(state, "pdk")).toBe("TSMC N3E");
  });

  it("should get recent history", () => {
    const manager = new ContextManager();
    const state = manager.getOrCreate("session-1", "user-1");
    manager.addToHistory(state, "user", "msg1");
    manager.addToHistory(state, "assistant", "msg2");
    manager.addToHistory(state, "user", "msg3");

    const recent = manager.getRecentHistory(state, 2);
    expect(recent.length).toBe(2);
  });
});

describe("ResponseGenerator", () => {
  it("should generate response for OPC intent", async () => {
    const generator = new ResponseGenerator();
    const intent: UserIntent = { name: "run_opc", confidence: 0.9, slots: {}, requiresConfirmation: true };
    const response = await generator.generate(intent, new Map());

    expect(response.message).toContain("OPC");
    expect(response.actions.length).toBe(1);
    expect(response.actions[0].type).toBe("submit_job");
  });

  it("should generate suggestions", async () => {
    const generator = new ResponseGenerator();
    const intent: UserIntent = { name: "run_opc", confidence: 0.9, slots: {}, requiresConfirmation: true };
    const response = await generator.generate(intent, new Map());

    expect(response.suggestions.length).toBeGreaterThan(0);
  });
});

describe("NLIV2Engine", () => {
  it("should process message and return response", async () => {
    const engine = new NLIV2Engine(testConfig);
    const response = await engine.processMessage("session-1", "user-1", "run opc correction");

    expect(response.message).toBeDefined();
    expect(response.intent.name).toBe("run_opc");
    expect(response.confidence).toBeGreaterThan(0);
  });

  it("should classify RCA intent", async () => {
    const engine = new NLIV2Engine(testConfig);
    const response = await engine.processMessage("session-1", "user-1", "investigate the failure");

    expect(response.intent.name).toBe("rca_investigate");
  });

  it("should extract slots", async () => {
    const engine = new NLIV2Engine(testConfig);
    const response = await engine.processMessage("session-1", "user-1", "run opc for metal1 layer with 50 iterations");

    expect(response.intent.slots.layer).toBe("metal1");
    expect(response.intent.slots.iterations).toBe(50);
  });

  it("should track conversation state", async () => {
    const engine = new NLIV2Engine(testConfig);
    await engine.processMessage("session-1", "user-1", "hello");
    await engine.processMessage("session-1", "user-1", "run opc");

    const state = engine.getContextManager().getOrCreate("session-1", "user-1");
    expect(state.turnCount).toBe(4);
    expect(state.history.length).toBe(4);
  });

  it("should require confirmation for critical intents", async () => {
    const engine = new NLIV2Engine(testConfig);
    const response = await engine.processMessage("session-1", "user-1", "run opc correction");

    expect(response.intent.requiresConfirmation).toBe(true);
  });

  it("should return unknown for unrecognized input", async () => {
    const engine = new NLIV2Engine(testConfig);
    const response = await engine.processMessage("session-1", "user-1", "hello world");

    expect(response.intent.name).toBe("unknown");
  });
});

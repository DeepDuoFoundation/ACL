import { describe, it, expect } from "vitest";
import { IntentClassifier } from "../src/classifier.js";
import { SlotExtractor } from "../src/slots.js";
import { ConversationManager } from "../src/conversation.js";

const testConfig = { maxSlots: 5, confidenceThreshold: 0.5 };

describe("IntentClassifier", () => {
  it("should classify OPC intent", async () => {
    const classifier = new IntentClassifier(testConfig);
    const intent = await classifier.classify("run opc correction on metal1");
    expect(intent.name).toBe("run_opc");
    expect(intent.confidence).toBeGreaterThan(0);
  });

  it("should classify layout analysis intent", async () => {
    const classifier = new IntentClassifier(testConfig);
    const intent = await classifier.classify("analyze the layout for hotspots");
    expect(intent.name).toBe("analyze_layout");
  });

  it("should classify simulation intent", async () => {
    const classifier = new IntentClassifier(testConfig);
    const intent = await classifier.classify("run simulation of the mask");
    expect(intent.name).toBe("simulate");
  });

  it("should classify PDK intent", async () => {
    const classifier = new IntentClassifier(testConfig);
    const intent = await classifier.classify("set pdk to TSMC N3E");
    expect(intent.name).toBe("set_pdk");
  });

  it("should return unknown for unrecognized input", async () => {
    const classifier = new IntentClassifier(testConfig);
    const intent = await classifier.classify("hello world");
    expect(intent.name).toBe("unknown");
  });
});

describe("SlotExtractor", () => {
  it("should extract layer slot", async () => {
    const extractor = new SlotExtractor(testConfig);
    const slots = await extractor.extract("run opc for metal1 layer");
    const layerSlot = slots.find((s) => s.name === "layer");
    expect(layerSlot).toBeDefined();
    expect(layerSlot!.value).toBe("metal1");
  });

  it("should extract pitch slot", async () => {
    const extractor = new SlotExtractor(testConfig);
    const slots = await extractor.extract("check pitch 42nm design");
    const pitchSlot = slots.find((s) => s.name === "pitch");
    expect(pitchSlot).toBeDefined();
    expect(pitchSlot!.value).toBe(42);
  });

  it("should extract iterations slot", async () => {
    const extractor = new SlotExtractor(testConfig);
    const slots = await extractor.extract("run with 100 iterations");
    const iterSlot = slots.find((s) => s.name === "iterations");
    expect(iterSlot).toBeDefined();
    expect(iterSlot!.value).toBe(100);
  });

  it("should extract multiple slots", async () => {
    const extractor = new SlotExtractor(testConfig);
    const slots = await extractor.extract("run opc for metal1 layer with 50 iterations");
    expect(slots.length).toBeGreaterThanOrEqual(2);
  });
});

describe("ConversationManager", () => {
  it("should process message and track context", async () => {
    const manager = new ConversationManager(testConfig);
    const result = await manager.processMessage("session-1", "run opc correction");

    expect(result.intent.name).toBe("run_opc");
    expect(result.context.sessionId).toBe("session-1");
    expect(result.context.history.length).toBe(1);
  });

  it("should maintain conversation history", async () => {
    const manager = new ConversationManager(testConfig);
    await manager.processMessage("session-1", "run opc");
    await manager.addAssistantResponse("session-1", "OPC started");
    await manager.processMessage("session-1", "check progress");

    const context = manager.getContext("session-1");
    expect(context!.history.length).toBe(3);
  });

  it("should clear context", async () => {
    const manager = new ConversationManager(testConfig);
    await manager.processMessage("session-1", "test");
    await manager.clearContext("session-1");
    expect(manager.getContext("session-1")).toBeUndefined();
  });

  it("should track active sessions", async () => {
    const manager = new ConversationManager(testConfig);
    await manager.processMessage("session-1", "test");
    await manager.processMessage("session-2", "test");
    expect(manager.getActiveSessions()).toContain("session-1");
    expect(manager.getActiveSessions()).toContain("session-2");
  });
});

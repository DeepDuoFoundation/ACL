import { describe, it, expect } from "vitest";
import type { AgentResponse, Intent, LayoutData } from "../src/index.js";
import { MAX_EPE_TARGET_NM } from "../src/index.js";

describe("shared types", () => {
  it("should have correct constant values", () => {
    expect(MAX_EPE_TARGET_NM).toBe(1.0);
  });

  it("AgentResponse has required fields", () => {
    const response: AgentResponse = {
      agentId: "test-agent",
      status: "completed",
      output: { type: "correction", data: {}, summary: "done" },
      metadata: { iteration: 1, confidence: 0.95, kgEvidenceNodes: [], runtimeMs: 100 },
      timestamp: new Date(),
    };
    expect(response.agentId).toBe("test-agent");
    expect(response.status).toBe("completed");
  });

  it("Intent has required fields", () => {
    const intent: Intent = {
      type: "run_opc",
      confidence: 0.9,
      entities: [{ type: "layout", value: "chip.gds" }],
      rawQuery: "Optimize this SRAM block",
    };
    expect(intent.type).toBe("run_opc");
  });
});

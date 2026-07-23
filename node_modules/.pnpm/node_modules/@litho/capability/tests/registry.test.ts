import { describe, it, expect } from "vitest";
import { CapabilityRegistry } from "../src/registry.js";

describe("CapabilityRegistry", () => {
  it("should register and retrieve a capability", async () => {
    const registry = new CapabilityRegistry();
    await registry.register({
      id: "test-cap",
      name: "Test Capability",
      version: "1.0.0",
      hooks: {
        init: async () => {},
        run: async (_ctx, input) => input,
        report: async () => ({ status: "ok" }),
        checkpoint: async () => {},
        teardown: async () => {},
      },
    });
    expect(registry.get("test-cap")).toBeDefined();
  });

  it("should execute a capability hook", async () => {
    const registry = new CapabilityRegistry();
    await registry.register({
      id: "echo",
      name: "Echo",
      version: "1.0.0",
      hooks: {
        init: async () => {},
        run: async (_ctx, input) => ({ echoed: input }),
        report: async () => ({}),
        checkpoint: async () => {},
        teardown: async () => {},
      },
    });
    const result = await registry.execute("echo", { sessionId: "s1", agentId: "a1" }, { hello: "world" });
    expect(result).toEqual({ echoed: { hello: "world" } });
  });
});

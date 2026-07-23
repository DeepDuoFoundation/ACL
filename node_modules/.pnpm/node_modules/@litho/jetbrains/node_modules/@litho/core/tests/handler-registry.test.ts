import { describe, it, expect } from "vitest";
import { HandlerRegistry } from "../src/handler-registry.js";

describe("HandlerRegistry", () => {
  it("should register and retrieve a handler", () => {
    const registry = new HandlerRegistry();
    registry.register("test-handler", async () => ({ status: "completed" }));
    const handler = registry.get("test-handler");
    expect(handler).toBeDefined();
  });

  it("should throw on duplicate registration", () => {
    const registry = new HandlerRegistry();
    registry.register("dup", async () => ({}));
    expect(() => registry.register("dup", async () => ({}))).toThrow("already registered");
  });

  it("should return undefined for unknown handler", () => {
    const registry = new HandlerRegistry();
    expect(registry.get("unknown")).toBeUndefined();
  });

  it("should list all registered handlers", () => {
    const registry = new HandlerRegistry();
    registry.register("a", async () => ({}));
    registry.register("b", async () => ({}));
    expect(registry.list()).toEqual(["a", "b"]);
  });
});

import { describe, it, expect } from "vitest";
import { resolveEndpoint, resolveSpec, PROVIDERS } from "../src/index.js";

describe("Provider Catalog", () => {
  it("should have 39 providers", () => {
    expect(Object.keys(PROVIDERS).length).toBe(39);
  });

  it("should resolve anthropic provider", () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const ep = resolveEndpoint("anthropic/claude-sonnet-4-20250514");
    expect(ep.providerId).toBe("anthropic");
    expect(ep.compat).toBe("anthropic-oc");
    expect(ep.baseURL).toBe("https://api.anthropic.com/v1");
    expect(ep.apiKey).toBe("test-key");
    expect(ep.model).toBe("claude-sonnet-4-20250514");
  });

  it("should resolve local vllm with no key", () => {
    const ep = resolveEndpoint("vllm");
    expect(ep.baseURL).toBe("http://localhost:8000/v1");
    expect(ep.compat).toBe("openai");
  });

  it("should throw on unknown provider", () => {
    expect(() => resolveEndpoint("nonexistent")).toThrow("Unknown provider");
  });
});

describe("Spec Resolution", () => {
  it("should resolve provider+model from opts", () => {
    expect(resolveSpec({ provider: "openai", model: "gpt-4o" })).toBe("openai/gpt-4o");
  });

  it("should resolve provider only", () => {
    expect(resolveSpec({ provider: "anthropic" })).toBe("anthropic");
  });

  it("should fallback to env var", () => {
    process.env.IA_PROVIDER_MODEL = "deepseek/deepseek-chat";
    expect(resolveSpec()).toBe("deepseek/deepseek-chat");
    delete process.env.IA_PROVIDER_MODEL;
  });
});

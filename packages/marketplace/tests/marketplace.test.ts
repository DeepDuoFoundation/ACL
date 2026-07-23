import { describe, it, expect } from "vitest";
import { PluginRegistry } from "../src/registry.js";
import { PluginSandbox } from "../src/sandbox.js";
import { SigningVerifier } from "../src/signing.js";
import type { PluginMetadata, PluginVersion } from "../src/types.js";

describe("PluginRegistry", () => {
  it("should register and retrieve plugins", () => {
    const registry = new PluginRegistry();
    const meta: PluginMetadata = { id: "test-plugin", name: "Test", version: "1.0.0", author: "test", description: "A test plugin", category: "agent", certified: true, publishedAt: Date.now(), updatedAt: Date.now() };
    registry.registerPlugin(meta);
    expect(registry.getPlugin("test-plugin")).toEqual(meta);
  });

  it("should list plugins by category", () => {
    const registry = new PluginRegistry();
    registry.registerPlugin({ id: "a", name: "A", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, publishedAt: 0, updatedAt: 0 });
    registry.registerPlugin({ id: "b", name: "B", version: "1.0.0", author: "x", description: "", category: "simulator", certified: true, publishedAt: 0, updatedAt: 0 });
    expect(registry.listPlugins("agent")).toHaveLength(1);
  });

  it("should search plugins by name", () => {
    const registry = new PluginRegistry();
    registry.registerPlugin({ id: "thermal-sim", name: "Thermal Simulator", version: "1.0.0", author: "x", description: "Simulates thermal effects", category: "simulator", certified: true, publishedAt: 0, updatedAt: 0 });
    expect(registry.search("thermal")).toHaveLength(1);
    expect(registry.search("optical")).toHaveLength(0);
  });

  it("should manage plugin versions", () => {
    const registry = new PluginRegistry();
    registry.registerPlugin({ id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, publishedAt: 0, updatedAt: 0 });
    const v1: PluginVersion = { version: "1.0.0", tarballHash: "abc", signature: "sig1", publishedAt: 1, minPlatformVersion: "3.0.0" };
    const v2: PluginVersion = { version: "2.0.0", tarballHash: "def", signature: "sig2", publishedAt: 2, minPlatformVersion: "3.0.0" };
    registry.addVersion("p1", v1);
    registry.addVersion("p1", v2);
    expect(registry.getVersions("p1")).toHaveLength(2);
    expect(registry.getLatestVersion("p1")?.version).toBe("2.0.0");
  });
});

describe("PluginSandbox", () => {
  it("should enforce filesystem restrictions", () => {
    const sandbox = new PluginSandbox();
    sandbox.configure("p1", { filesystemAccess: "read-only" });
    expect(sandbox.canAccessFilesystem("p1", "read")).toBe(true);
    expect(sandbox.canAccessFilesystem("p1", "write")).toBe(false);
  });

  it("should enforce network restrictions", () => {
    const sandbox = new PluginSandbox();
    expect(sandbox.canAccessNetwork("unknown")).toBe(false);
    sandbox.configure("p1", { networkAccess: true });
    expect(sandbox.canAccessNetwork("p1")).toBe(true);
  });

  it("should validate plugin metadata", () => {
    const sandbox = new PluginSandbox();
    const valid = sandbox.validatePlugin({ id: "ok", name: "OK", version: "1.0", author: "me", description: "", category: "agent", certified: true, publishedAt: 0, updatedAt: 0 });
    expect(valid.valid).toBe(true);
    const invalid = sandbox.validatePlugin({ id: "", name: "", version: "", author: "", description: "", category: "agent", certified: false, publishedAt: 0, updatedAt: 0 });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });
});

describe("SigningVerifier", () => {
  it("should verify certified plugins", () => {
    const verifier = new SigningVerifier();
    const meta: PluginMetadata = { id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, signature: "sig", publishedAt: 0, updatedAt: 0 };
    expect(verifier.verifyPlugin(meta).valid).toBe(true);
  });

  it("should reject uncertified plugins", () => {
    const verifier = new SigningVerifier();
    const meta: PluginMetadata = { id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: false, publishedAt: 0, updatedAt: 0 };
    expect(verifier.verifyPlugin(meta).valid).toBe(false);
  });

  it("should verify version integrity", () => {
    const verifier = new SigningVerifier();
    const plugin: PluginMetadata = { id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, signature: "sig", publishedAt: 0, updatedAt: 0 };
    const version: PluginVersion = { version: "1.0.0", tarballHash: "abc", signature: "sig", publishedAt: 0, minPlatformVersion: "3.0.0" };
    expect(verifier.verifyIntegrity(plugin, version).valid).toBe(true);
  });
});

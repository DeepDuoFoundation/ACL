import { describe, it, expect } from "vitest";
import { PDKManager } from "../src/manager.js";
import { TSMCN3E } from "../src/tsmc-n3e.js";
import { SamsungSF3 } from "../src/samsung-sf3.js";
import { GF22FDX } from "../src/gf-22fdx.js";

describe("PDKManager", () => {
  it("should list available PDKs", () => {
    const manager = new PDKManager();
    const pdkList = manager.listAvailable();
    expect(pdkList).toContain("TSMC N3E");
    expect(pdkList).toContain("Samsung SF3");
    expect(pdkList).toContain("Intel 18A");
  });

  it("should load TSMC N3E PDK", () => {
    const manager = new PDKManager();
    const pdk = manager.loadPDK("TSMC N3E");
    expect(pdk.name).toBe("TSMC N3E");
    expect(pdk.node).toBe("3nm");
    expect(pdk.layers.length).toBeGreaterThan(0);
  });

  it("should load Samsung SF3 PDK", () => {
    const manager = new PDKManager();
    const pdk = manager.loadPDK("Samsung SF3");
    expect(pdk.name).toBe("Samsung SF3");
    expect(pdk.vendor).toBe("Samsung");
  });

  it("should get layer by name", () => {
    const manager = new PDKManager();
    manager.loadPDK("TSMC N3E");
    const m1 = manager.getLayer("M1");
    expect(m1.name).toBe("M1");
    expect(m1.minWidth).toBe(21);
    expect(m1.minPitch).toBe(42);
  });

  it("should get OPC rule for layer", () => {
    const manager = new PDKManager();
    manager.loadPDK("TSMC N3E");
    const rule = manager.getOPCRule("M1");
    expect(rule.layer).toBe("M1");
    expect(rule.type).toBe("model_based");
    expect(rule.aggressiveness).toBe(0.8);
  });

  it("should validate design rules", () => {
    const manager = new PDKManager();
    manager.loadPDK("TSMC N3E");
    expect(manager.validateDesignRule("min_width", 25, "M1")).toBe(true);
    expect(manager.validateDesignRule("min_width", 15, "M1")).toBe(false);
    expect(manager.validateDesignRule("min_pitch", 42, "M1")).toBe(true);
    expect(manager.validateDesignRule("min_pitch", 30, "M1")).toBe(false);
  });

  it("should throw for unknown PDK", () => {
    const manager = new PDKManager();
    expect(() => manager.loadPDK("Unknown PDK")).toThrow("PDK not found");
  });

  it("should throw for unknown layer", () => {
    const manager = new PDKManager();
    manager.loadPDK("TSMC N3E");
    expect(() => manager.getLayer("Unknown")).toThrow("Layer not found");
  });

  it("should return design rules", () => {
    const manager = new PDKManager();
    manager.loadPDK("TSMC N3E");
    const rules = manager.getDesignRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((r) => r.name === "min_width")).toBe(true);
  });

  it("should have correct illumination params", () => {
    const manager = new PDKManager();
    const pdk = manager.loadPDK("TSMC N3E");
    expect(pdk.illumination.wavelength).toBe(13.5);
    expect(pdk.illumination.na).toBe(0.55);
  });

  it("should load Intel 18A PDK", () => {
    const manager = new PDKManager();
    const config = manager.loadPDK("Intel 18A");
    expect(config.node).toBe("18A");
    expect(config.vendor).toBe("Intel Foundry");
    expect(config.illumination.na).toBe(0.55);
    expect(config.layers.length).toBeGreaterThanOrEqual(4);
    expect(manager.listAvailable()).toContain("Intel 18A");
  });

  it("should load GF 22FDX PDK", () => {
    const manager = new PDKManager();
    const config = manager.loadPDK("GF 22FDX");
    expect(config.node).toBe("22FDX");
    expect(config.vendor).toBe("GlobalFoundries");
    expect(config.illumination.wavelength).toBe(193);
    expect(config.resist.type).toBe("ArF");
    expect(manager.listAvailable()).toContain("GF 22FDX");
  });
});

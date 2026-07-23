import { describe, it, expect } from "vitest";
import { RuleBasedOPC } from "../src/rule-based-opc.js";
import { ILTSynthesis } from "../src/ilt-synthesis.js";
import { FDTDSimulator } from "../src/fdtd-simulator.js";
import { PINNSimulator } from "../src/pinn-simulator.js";
import { OPcILTPipeline } from "../src/pipeline.js";
import type { MaskPattern, PipelineConfig } from "../src/types.js";

const testMask: MaskPattern = {
  layer: "metal1",
  polygons: [
    { x: 100, y: 100, width: 50, height: 20 },
    { x: 200, y: 100, width: 50, height: 20 },
    { x: 300, y: 100, width: 50, height: 20 },
  ],
  pitch: 100,
  mpc: 1.5,
};

const testConfig: PipelineConfig = {
  mode: "fast",
  maxIterations: 50,
  convergenceThreshold: 0.1,
  useGPU: false,
  pdk: "tsmc-n3e",
};

describe("RuleBasedOPC", () => {
  it("should correct mask pattern", async () => {
    const opc = new RuleBasedOPC(testConfig);
    const result = await opc.correct(testMask);

    expect(result.correctedMask.polygons.length).toBe(3);
    expect(result.correctionTime).toBeGreaterThanOrEqual(0);
    expect(typeof result.convergence).toBe("boolean");
  });
});

describe("ILTSynthesis", () => {
  it("should synthesize optimal mask", async () => {
    const ilt = new ILTSynthesis(testConfig);
    const result = await ilt.synthesize(testMask);

    expect(result.optimalMask.polygons.length).toBe(3);
    expect(result.costFunction).toBeGreaterThanOrEqual(0);
  });
});

describe("FDTDSimulator", () => {
  it("should simulate aerial image", async () => {
    const fdtd = new FDTDSimulator(false);
    const result = await fdtd.simulate(testMask);

    expect(result.aerialImage.length).toBe(128);
    expect(result.epe.length).toBeGreaterThan(0);
  });
});

describe("PINNSimulator", () => {
  it("should simulate with PINN model", async () => {
    const pinn = new PINNSimulator();
    const result = await pinn.simulate(testMask);

    expect(result.aerialImage.length).toBe(64);
    expect(result.resistImage.length).toBe(64);
  });
});

describe("OPcILTPipeline", () => {
  it("should run full pipeline in fast mode", async () => {
    const pipeline = new OPcILTPipeline(testConfig);
    const result = await pipeline.run(testMask);

    expect(result.opcResult.correctedMask.polygons.length).toBe(3);
    expect(result.fdtdSimulation.aerialImage.length).toBe(128);
    expect(result.pinnSimulation.aerialImage.length).toBe(64);
  });

  it("should run in accurate mode with ILT", async () => {
    const accurateConfig = { ...testConfig, mode: "accurate" as const };
    const pipeline = new OPcILTPipeline(accurateConfig);
    const result = await pipeline.run(testMask);

    expect(result.iltResult.optimalMask.polygons.length).toBe(3);
    expect(result.iltResult.costFunction).toBeGreaterThanOrEqual(0);
  });
});

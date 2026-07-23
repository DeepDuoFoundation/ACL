import { describe, it, expect } from "vitest";
import { DieStackModel } from "../src/die-stack.js";
import { ThermalSimulator } from "../src/thermal.js";
import { MultiDieCorrector } from "../src/correction.js";
import type { DieLayer } from "../src/types.js";

const makeDie = (id: string, tdp: number): DieLayer => ({
  id, name: `Die ${id}`, width: 10, height: 10, thickness: 50, material: "silicon", tdp,
});

describe("DieStackModel", () => {
  it("should create and manage stacks", () => {
    const model = new DieStackModel();
    const stack = model.createStack("s1", "Test Stack", [makeDie("d1", 5), makeDie("d2", 8)], "face-to-face");
    expect(stack.dies).toHaveLength(2);
    expect(model.getStack("s1")).toBe(stack);
  });

  it("should add and remove dies", () => {
    const model = new DieStackModel();
    model.createStack("s1", "Stack", [makeDie("d1", 5)], "hybrid");
    model.addDie("s1", makeDie("d2", 3));
    expect(model.getDieCount("s1")).toBe(2);
    model.removeDie("s1", "d2");
    expect(model.getDieCount("s1")).toBe(1);
  });

  it("should calculate total height and power", () => {
    const model = new DieStackModel();
    model.createStack("s1", "Stack", [makeDie("d1", 5), makeDie("d2", 8)], "hybrid");
    expect(model.getTotalHeight("s1")).toBe(100);
    expect(model.getTotalPower("s1")).toBe(13);
  });
});

describe("ThermalSimulator", () => {
  it("should simulate thermal profiles", () => {
    const sim = new ThermalSimulator();
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 5), makeDie("d2", 20)], bondingType: "hybrid" as const };
    const profiles = sim.simulate(stack);
    expect(profiles).toHaveLength(2);
    expect(profiles[0].dieId).toBe("d1");
    expect(profiles[1].dieId).toBe("d2");
  });

  it("should identify worst die", () => {
    const sim = new ThermalSimulator();
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 5), makeDie("d2", 50)], bondingType: "hybrid" as const };
    const profiles = sim.simulate(stack);
    const worst = sim.getWorstDie(profiles);
    expect(worst?.dieId).toBe("d2");
  });

  it("should detect throttling need", () => {
    const sim = new ThermalSimulator({ thermalThrottleTemp: 80 });
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 100)], bondingType: "hybrid" as const };
    const profiles = sim.simulate(stack);
    expect(sim.needsThrottling(profiles)).toBe(true);
  });

  it("should compute derating factor", () => {
    const sim = new ThermalSimulator();
    expect(sim.getDeratingFactor(50)).toBe(1.0);
    expect(sim.getDeratingFactor(85)).toBeLessThan(1.0);
    expect(sim.getDeratingFactor(110)).toBe(0.7);
  });
});

describe("MultiDieCorrector", () => {
  it("should correct die EPE with thermal derating", () => {
    const corrector = new MultiDieCorrector();
    const epe = [[0.5, 0.6], [0.7, 0.8]];
    const result = corrector.correctDie("d1", "Metal1", epe, 0.9);
    expect(result.dieId).toBe("d1");
    expect(result.epeMap[0][0]).toBeCloseTo(0.45);
    expect(result.thermalDerating).toBe(0.9);
  });

  it("should correct full stack", () => {
    const corrector = new MultiDieCorrector();
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 5), makeDie("d2", 8)], bondingType: "hybrid" as const };
    const profiles = [{ dieId: "d1", maxTemperature: 60, hotspotCount: 0, hotspotLocations: [], coolingRequired: false }, { dieId: "d2", maxTemperature: 90, hotspotCount: 1, hotspotLocations: [], coolingRequired: false }];
    const results = corrector.correctStack(stack, "Metal1", profiles);
    expect(results).toHaveLength(2);
    expect(results[0].thermalDerating).toBe(1.0);
  });
});
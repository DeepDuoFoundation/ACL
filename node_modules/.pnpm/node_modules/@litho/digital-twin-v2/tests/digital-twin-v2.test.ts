import { describe, it, expect } from "vitest";
import { DigitalTwinV2 } from "../src/twin.js";
import { CalibrationEngine } from "../src/calibration.js";
import { DriftDetector } from "../src/drift.js";
import type { DigitalTwinConfig, CalibrationData } from "../src/types.js";

const testConfig: DigitalTwinConfig = {
  calibrationInterval: 3600000,
  driftThreshold: 0.02,
  maxCalibrationAge: 86400000,
  enableClosedLoop: true,
};

const testCalibration: CalibrationData = {
  id: "cal-1",
  timestamp: Date.now(),
  scannerId: "scanner-1",
  resistThickness: 30,
  focusOffset: 0.1,
  doseOffset: 0.5,
  overlayError: 0.02,
  cdUniformity: 0.03,
  metrologySource: "KLA",
};

describe("CalibrationEngine", () => {
  it("should calibrate and store data", async () => {
    const engine = new CalibrationEngine(testConfig);
    const result = await engine.calibrate(testCalibration);

    expect(result.id).toBe("cal-1");
    const current = await engine.getCalibration();
    expect(current).not.toBeNull();
  });

  it("should check if calibration is stale", async () => {
    const engine = new CalibrationEngine(testConfig);
    await engine.calibrate(testCalibration);

    const stale = await engine.isCalibrationStale();
    expect(stale).toBe(false);
  });

  it("should interpolate calibration", async () => {
    const engine = new CalibrationEngine(testConfig);
    const old: CalibrationData = { ...testCalibration, timestamp: Date.now() - 1000, resistThickness: 28 };
    const newCal: CalibrationData = { ...testCalibration, timestamp: Date.now() + 1000, resistThickness: 32 };

    await engine.calibrate(old);
    await engine.calibrate(newCal);

    const interpolated = await engine.interpolateCalibration(Date.now());
    expect(interpolated.resistThickness).toBeGreaterThan(28);
    expect(interpolated.resistThickness).toBeLessThan(32);
  });
});

describe("DriftDetector", () => {
  it("should detect drift", async () => {
    const detector = new DriftDetector(testConfig);
    await detector.setBaseline(testCalibration);

    const drifted: CalibrationData = { ...testCalibration, resistThickness: 35 };
    const alerts = await detector.detectDrift(drifted);

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].parameter).toBe("resistThickness");
  });

  it("should not detect drift for same values", async () => {
    const detector = new DriftDetector(testConfig);
    await detector.setBaseline(testCalibration);

    const alerts = await detector.detectDrift(testCalibration);
    expect(alerts.length).toBe(0);
  });

  it("should filter alerts by severity", async () => {
    const detector = new DriftDetector(testConfig);
    await detector.setBaseline(testCalibration);

    const drifted: CalibrationData = { ...testCalibration, resistThickness: 40 };
    await detector.detectDrift(drifted);

    const critical = await detector.getAlertsBySeverity("critical");
    expect(critical.length).toBeGreaterThan(0);
  });
});

describe("DigitalTwinV2", () => {
  it("should calibrate and simulate", async () => {
    const twin = new DigitalTwinV2(testConfig);
    const { calibration, driftAlerts } = await twin.calibrate(testCalibration);

    expect(calibration.id).toBe("cal-1");
    expect(driftAlerts).toBeDefined();

    const mask = Array.from({ length: 32 }, () => Array.from({ length: 32 }, () => Math.random() > 0.5 ? 1 : 0));
    const result = await twin.simulate(mask, "M1");

    expect(result.aerialImage.length).toBe(32);
    expect(result.epe).toBeGreaterThanOrEqual(0);
    expect(result.processWindow).toBeGreaterThan(0);
  });

  it("should get calibration engine", () => {
    const twin = new DigitalTwinV2(testConfig);
    expect(twin.getCalibrationEngine()).toBeDefined();
  });

  it("should get drift detector", () => {
    const twin = new DigitalTwinV2(testConfig);
    expect(twin.getDriftDetector()).toBeDefined();
  });
});

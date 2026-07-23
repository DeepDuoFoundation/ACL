import { describe, it, expect } from "vitest";
import { MetrologyCollector } from "../src/collector.js";
import { CalibrationEngine } from "../src/calibrator.js";
import { DriftDetector } from "../src/drift-alert.js";
import type { MetrologyReading } from "../src/types.js";

const makeReading = (toolId: string, layer: string, cdMean: number, ts?: number): MetrologyReading => ({
  id: `r-${Date.now()}`, toolId, timestamp: ts ?? Date.now(), cdMean, cdStd: 0.1, overlayX: 0.5, overlayY: 0.3, defectCount: 0, waferId: "w1", layer,
});

describe("MetrologyCollector", () => {
  it("should collect and retrieve readings", () => {
    const collector = new MetrologyCollector();
    collector.addReading(makeReading("tool1", "Metal1", 20.1));
    collector.addReading(makeReading("tool1", "Metal1", 20.3));
    expect(collector.getReadings("tool1", "Metal1")).toHaveLength(2);
    expect(collector.getAverageCD("tool1", "Metal1")).toBeCloseTo(20.2);
  });

  it("should return recent readings", () => {
    const collector = new MetrologyCollector();
    for (let i = 0; i < 10; i++) collector.addReading(makeReading("t1", "M1", 20 + i * 0.1));
    const recent = collector.getRecentReadings("t1", "M1", 3);
    expect(recent).toHaveLength(3);
  });
});

describe("CalibrationEngine", () => {
  it("should calibrate with enough readings", () => {
    const engine = new CalibrationEngine({ minReadingsForCalibration: 5 });
    const readings = Array.from({ length: 10 }, (_, i) => makeReading("t1", "M1", 20 + i * 0.1, Date.now() - (10 - i) * 1000));
    const result = engine.calibrate("t1", "M1", readings);
    expect(result).not.toBeNull();
    expect(result!.toolId).toBe("t1");
    expect(result!.confidence).toBeGreaterThan(0);
  });

  it("should return null with insufficient readings", () => {
    const engine = new CalibrationEngine({ minReadingsForCalibration: 20 });
    const result = engine.calibrate("t1", "M1", [makeReading("t1", "M1", 20)]);
    expect(result).toBeNull();
  });

  it("should track calibration history", () => {
    const engine = new CalibrationEngine({ minReadingsForCalibration: 1 });
    engine.calibrate("t1", "M1", [makeReading("t1", "M1", 20)]);
    engine.calibrate("t1", "M1", [makeReading("t1", "M1", 20.1)]);
    expect(engine.getHistory("t1")).toHaveLength(2);
    expect(engine.getLatest("t1", "M1")?.confidence).toBeGreaterThan(0);
  });
});

describe("DriftDetector", () => {
  it("should detect drift when exceeding threshold", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 1.0 });
    detector.setBaseline("t1", "M1", 20.0);
    const alert = detector.detectDrift(makeReading("t1", "M1", 20.3));
    expect(alert).not.toBeNull();
    expect(alert!.severity).toBe("warning");
  });

  it("should not alert within threshold", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 5.0 });
    detector.setBaseline("t1", "M1", 20.0);
    const alert = detector.detectDrift(makeReading("t1", "M1", 20.5));
    expect(alert).toBeNull();
  });

  it("should detect critical drift", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 2.0, driftThresholdCritical: 5.0 });
    detector.setBaseline("t1", "M1", 20.0);
    const alert = detector.detectDrift(makeReading("t1", "M1", 22.0));
    expect(alert?.severity).toBe("critical");
  });

  it("should track alert history", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 1.0 });
    detector.setBaseline("t1", "M1", 20.0);
    detector.detectDrift(makeReading("t1", "M1", 22.0));
    detector.detectDrift(makeReading("t1", "M1", 23.0));
    expect(detector.getAlerts()).toHaveLength(2);
    expect(detector.getAlerts("critical")).toHaveLength(2);
  });
});
import type { CalibrationData, DigitalTwinConfig } from "./types.js";

export class CalibrationEngine {
  private config: DigitalTwinConfig;
  private calibrationHistory: CalibrationData[] = [];
  private currentCalibration: CalibrationData | null = null;

  constructor(config: DigitalTwinConfig) {
    this.config = config;
  }

  async calibrate(data: CalibrationData): Promise<CalibrationData> {
    this.calibrationHistory.push(data);
    this.currentCalibration = data;

    if (this.calibrationHistory.length > 100) {
      this.calibrationHistory.shift();
    }

    return data;
  }

  async getCalibration(): Promise<CalibrationData | null> {
    return this.currentCalibration;
  }

  async getHistory(): Promise<CalibrationData[]> {
    return [...this.calibrationHistory];
  }

  async isCalibrationStale(): Promise<boolean> {
    if (!this.currentCalibration) return true;
    return Date.now() - this.currentCalibration.timestamp > this.config.maxCalibrationAge;
  }

  async interpolateCalibration(timestamp: number): Promise<CalibrationData> {
    if (this.calibrationHistory.length === 0) {
      throw new Error("No calibration data available");
    }

    const sorted = [...this.calibrationHistory].sort((a, b) => a.timestamp - b.timestamp);

    if (timestamp <= sorted[0].timestamp) return sorted[0];
    if (timestamp >= sorted[sorted.length - 1].timestamp) return sorted[sorted.length - 1];

    let before = sorted[0];
    let after = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].timestamp <= timestamp && sorted[i + 1].timestamp >= timestamp) {
        before = sorted[i];
        after = sorted[i + 1];
        break;
      }
    }

    const ratio = (timestamp - before.timestamp) / (after.timestamp - before.timestamp);

    return {
      id: `interp-${timestamp}`,
      timestamp,
      scannerId: before.scannerId,
      resistThickness: before.resistThickness + (after.resistThickness - before.resistThickness) * ratio,
      focusOffset: before.focusOffset + (after.focusOffset - before.focusOffset) * ratio,
      doseOffset: before.doseOffset + (after.doseOffset - before.doseOffset) * ratio,
      overlayError: before.overlayError + (after.overlayError - before.overlayError) * ratio,
      cdUniformity: before.cdUniformity + (after.cdUniformity - before.cdUniformity) * ratio,
      metrologySource: "interpolated",
    };
  }
}

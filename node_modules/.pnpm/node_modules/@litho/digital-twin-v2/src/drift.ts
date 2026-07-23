import type { CalibrationData, DriftAlert, DigitalTwinConfig } from "./types.js";

export class DriftDetector {
  private config: DigitalTwinConfig;
  private baseline: CalibrationData | null = null;
  private alerts: DriftAlert[] = [];

  constructor(config: DigitalTwinConfig) {
    this.config = config;
  }

  async setBaseline(data: CalibrationData): Promise<void> {
    this.baseline = data;
  }

  async detectDrift(current: CalibrationData): Promise<DriftAlert[]> {
    if (!this.baseline) return [];

    const newAlerts: DriftAlert[] = [];

    const parameters: Array<{ name: keyof CalibrationData; threshold: number }> = [
      { name: "resistThickness", threshold: 2.0 },
      { name: "focusOffset", threshold: 0.5 },
      { name: "doseOffset", threshold: 1.0 },
      { name: "overlayError", threshold: 0.1 },
      { name: "cdUniformity", threshold: 0.05 },
    ];

    for (const param of parameters) {
      const baselineVal = this.baseline[param.name] as number;
      const currentVal = current[param.name] as number;

      if (typeof baselineVal !== "number" || typeof currentVal !== "number") continue;

      const drift = Math.abs(currentVal - baselineVal);
      const driftMagnitude = drift / (Math.abs(baselineVal) || 1);

      if (driftMagnitude > this.config.driftThreshold) {
        const alert: DriftAlert = {
          id: `drift-${Date.now()}-${param.name}`,
          timestamp: Date.now(),
          parameter: param.name,
          expectedValue: baselineVal,
          actualValue: currentVal,
          driftMagnitude,
          severity: this.computeSeverity(driftMagnitude),
          scannerId: current.scannerId,
        };

        newAlerts.push(alert);
        this.alerts.push(alert);
      }
    }

    return newAlerts;
  }

  private computeSeverity(driftMagnitude: number): DriftAlert["severity"] {
    if (driftMagnitude > 0.1) return "critical";
    if (driftMagnitude > 0.05) return "high";
    if (driftMagnitude > 0.02) return "medium";
    return "low";
  }

  async getAlerts(): Promise<DriftAlert[]> {
    return [...this.alerts];
  }

  async getAlertsBySeverity(severity: DriftAlert["severity"]): Promise<DriftAlert[]> {
    return this.alerts.filter((a) => a.severity === severity);
  }

  async clearAlerts(): Promise<void> {
    this.alerts = [];
  }
}

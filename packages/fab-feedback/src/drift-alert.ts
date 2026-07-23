import type { MetrologyReading, DriftAlert, FabFeedbackConfig } from "./types.js";

const DEFAULT_CONFIG: FabFeedbackConfig = {
  driftThresholdWarning: 2.0,
  driftThresholdCritical: 5.0,
  calibrationWindow: 24 * 60 * 60 * 1000,
  minReadingsForCalibration: 10,
};

export class DriftDetector {
  private config: FabFeedbackConfig;
  private alerts: DriftAlert[] = [];
  private baselines = new Map<string, number>();

  constructor(config: Partial<FabFeedbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setBaseline(toolId: string, layer: string, cdMean: number): void {
    this.baselines.set(`${toolId}:${layer}`, cdMean);
  }

  getBaseline(toolId: string, layer: string): number | undefined {
    return this.baselines.get(`${toolId}:${layer}`);
  }

  detectDrift(reading: MetrologyReading): DriftAlert | null {
    const key = `${reading.toolId}:${reading.layer}`;
    const baseline = this.baselines.get(key);
    if (baseline === undefined) return null;
    const deviation = Math.abs(reading.cdMean - baseline);
    const deviationPercent = (deviation / baseline) * 100;
    let severity: DriftAlert["severity"] = "info";
    if (deviationPercent >= this.config.driftThresholdCritical) severity = "critical";
    else if (deviationPercent >= this.config.driftThresholdWarning) severity = "warning";
    if (severity === "info") return null;
    const alert: DriftAlert = {
      id: `drift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      toolId: reading.toolId,
      parameter: "cd_mean",
      currentValue: reading.cdMean,
      baselineValue: baseline,
      deviation: deviationPercent,
      severity,
      timestamp: Date.now(),
    };
    this.alerts.push(alert);
    return alert;
  }

  getAlerts(severity?: DriftAlert["severity"]): DriftAlert[] {
    if (severity) return this.alerts.filter((a) => a.severity === severity);
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}
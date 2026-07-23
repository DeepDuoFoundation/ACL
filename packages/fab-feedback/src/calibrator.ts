import type { MetrologyReading, CalibrationResult, FabFeedbackConfig } from "./types.js";

const DEFAULT_CONFIG: FabFeedbackConfig = {
  driftThresholdWarning: 2.0,
  driftThresholdCritical: 5.0,
  calibrationWindow: 24 * 60 * 60 * 1000,
  minReadingsForCalibration: 10,
};

export class CalibrationEngine {
  private config: FabFeedbackConfig;
  private calibrationHistory: CalibrationResult[] = [];

  constructor(config: Partial<FabFeedbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  calibrate(toolId: string, layer: string, readings: MetrologyReading[]): CalibrationResult | null {
    if (readings.length < this.config.minReadingsForCalibration) return null;
    const recentWindow = Date.now() - this.config.calibrationWindow;
    const recent = readings.filter((r) => r.timestamp >= recentWindow);
    if (recent.length === 0) return null;
    const avgCd = recent.reduce((sum, r) => sum + r.cdMean, 0) / recent.length;
    const avgOverlay = recent.reduce((sum, r) => sum + Math.sqrt(r.overlayX ** 2 + r.overlayY ** 2), 0) / recent.length;
    const targetCd = 20;
    const correctionFactor = targetCd / avgCd;
    const offsetApplied = targetCd - avgCd;
    const confidence = Math.max(0, Math.min(1, 1 - avgOverlay / 10));
    const result: CalibrationResult = { toolId, layer, correctionFactor, offsetApplied, confidence, timestamp: Date.now() };
    this.calibrationHistory.push(result);
    return result;
  }

  getHistory(toolId?: string, layer?: string): CalibrationResult[] {
    let results = this.calibrationHistory;
    if (toolId) results = results.filter((r) => r.toolId === toolId);
    if (layer) results = results.filter((r) => r.layer === layer);
    return results;
  }

  getLatest(toolId: string, layer: string): CalibrationResult | undefined {
    return this.getHistory(toolId, layer).at(-1);
  }
}
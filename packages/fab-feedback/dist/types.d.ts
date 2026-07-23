export interface MetrologyReading {
    id: string;
    toolId: string;
    timestamp: number;
    cdMean: number;
    cdStd: number;
    overlayX: number;
    overlayY: number;
    defectCount: number;
    waferId: string;
    layer: string;
}
export interface DriftAlert {
    id: string;
    toolId: string;
    parameter: string;
    currentValue: number;
    baselineValue: number;
    deviation: number;
    severity: "info" | "warning" | "critical";
    timestamp: number;
}
export interface CalibrationResult {
    toolId: string;
    layer: string;
    correctionFactor: number;
    offsetApplied: number;
    confidence: number;
    timestamp: number;
}
export interface FabFeedbackConfig {
    driftThresholdWarning: number;
    driftThresholdCritical: number;
    calibrationWindow: number;
    minReadingsForCalibration: number;
}

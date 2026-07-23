import type { MetrologyReading, CalibrationResult, FabFeedbackConfig } from "./types.js";
export declare class CalibrationEngine {
    private config;
    private calibrationHistory;
    constructor(config?: Partial<FabFeedbackConfig>);
    calibrate(toolId: string, layer: string, readings: MetrologyReading[]): CalibrationResult | null;
    getHistory(toolId?: string, layer?: string): CalibrationResult[];
    getLatest(toolId: string, layer: string): CalibrationResult | undefined;
}

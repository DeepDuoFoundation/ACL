import type { CalibrationData, DriftAlert, DigitalTwinConfig } from "./types.js";
export declare class DriftDetector {
    private config;
    private baseline;
    private alerts;
    constructor(config: DigitalTwinConfig);
    setBaseline(data: CalibrationData): Promise<void>;
    detectDrift(current: CalibrationData): Promise<DriftAlert[]>;
    private computeSeverity;
    getAlerts(): Promise<DriftAlert[]>;
    getAlertsBySeverity(severity: DriftAlert["severity"]): Promise<DriftAlert[]>;
    clearAlerts(): Promise<void>;
}
//# sourceMappingURL=drift.d.ts.map
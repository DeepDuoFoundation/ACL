import type { CalibrationData, DigitalTwinConfig } from "./types.js";
export declare class CalibrationEngine {
    private config;
    private calibrationHistory;
    private currentCalibration;
    constructor(config: DigitalTwinConfig);
    calibrate(data: CalibrationData): Promise<CalibrationData>;
    getCalibration(): Promise<CalibrationData | null>;
    getHistory(): Promise<CalibrationData[]>;
    isCalibrationStale(): Promise<boolean>;
    interpolateCalibration(timestamp: number): Promise<CalibrationData>;
}
//# sourceMappingURL=calibration.d.ts.map
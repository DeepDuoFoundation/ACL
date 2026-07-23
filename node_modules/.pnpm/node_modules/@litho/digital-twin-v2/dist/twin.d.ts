import type { DigitalTwinConfig, CalibrationData, SimulationResult, DriftAlert } from "./types.js";
import { CalibrationEngine } from "./calibration.js";
import { DriftDetector } from "./drift.js";
export declare class DigitalTwinV2 {
    private config;
    private calibrationEngine;
    private driftDetector;
    constructor(config: DigitalTwinConfig);
    calibrate(data: CalibrationData): Promise<{
        calibration: CalibrationData;
        driftAlerts: DriftAlert[];
    }>;
    simulate(mask: number[][], layer: string): Promise<SimulationResult>;
    private computeAerialImage;
    private computeResistProfile;
    private computeEPE;
    private computeCD;
    private computeProcessWindow;
    getCalibrationEngine(): CalibrationEngine;
    getDriftDetector(): DriftDetector;
}
//# sourceMappingURL=twin.d.ts.map
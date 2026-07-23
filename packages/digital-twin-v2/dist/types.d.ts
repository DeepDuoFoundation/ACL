export interface DigitalTwinConfig {
    calibrationInterval: number;
    driftThreshold: number;
    maxCalibrationAge: number;
    enableClosedLoop: boolean;
}
export interface CalibrationData {
    id: string;
    timestamp: number;
    scannerId: string;
    resistThickness: number;
    focusOffset: number;
    doseOffset: number;
    overlayError: number;
    cdUniformity: number;
    metrologySource: string;
}
export interface DriftAlert {
    id: string;
    timestamp: number;
    parameter: string;
    expectedValue: number;
    actualValue: number;
    driftMagnitude: number;
    severity: "low" | "medium" | "high" | "critical";
    scannerId: string;
}
export interface SimulationResult {
    aerialImage: number[][];
    resistProfile: number[][];
    epe: number;
    cd: number;
    processWindow: number;
}
//# sourceMappingURL=types.d.ts.map
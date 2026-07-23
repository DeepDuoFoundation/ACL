export interface DieLayer {
    id: string;
    name: string;
    width: number;
    height: number;
    thickness: number;
    material: string;
    tdp: number;
}
export interface DieStack {
    id: string;
    name: string;
    dies: DieLayer[];
    bondingType: "hybrid" | "face-to-face" | "face-to-back";
    interposer?: {
        width: number;
        height: number;
        material: string;
    };
}
export interface ThermalProfile {
    dieId: string;
    maxTemperature: number;
    hotspotCount: number;
    hotspotLocations: {
        x: number;
        y: number;
        temp: number;
    }[];
    coolingRequired: boolean;
}
export interface MultiDieCorrection {
    dieId: string;
    layer: string;
    epeMap: number[][];
    correctionApplied: boolean;
    thermalDerating: number;
}
export interface ThreeDICConfig {
    maxStackHeight: number;
    thermalThrottleTemp: number;
    interposerConductivity: number;
}

import type { DieStack, MultiDieCorrection, ThermalProfile } from "./types.js";
export declare class MultiDieCorrector {
    correctDie(dieId: string, layer: string, epeMap: number[][], thermalDerating: number): MultiDieCorrection;
    correctStack(stack: DieStack, layer: string, thermalProfiles: ThermalProfile[]): MultiDieCorrection[];
    getThermalDerating(profile: ThermalProfile): number;
}

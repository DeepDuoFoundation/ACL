import type { DieStack, ThermalProfile, ThreeDICConfig } from "./types.js";
export declare class ThermalSimulator {
    private config;
    constructor(config?: Partial<ThreeDICConfig>);
    simulate(stack: DieStack): ThermalProfile[];
    getWorstDie(profiles: ThermalProfile[]): ThermalProfile | undefined;
    needsThrottling(profiles: ThermalProfile[]): boolean;
    getDeratingFactor(temp: number): number;
}

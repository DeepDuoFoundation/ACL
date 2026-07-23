import type { MaskPattern, SimulationResult } from "./types.js";
export declare class FDTDSimulator {
    private useGPU;
    constructor(useGPU?: boolean);
    simulate(mask: MaskPattern): Promise<SimulationResult>;
    private computeAerialImage;
    private computeResistImage;
    private extractEPE;
    private extractCD;
}
//# sourceMappingURL=fdtd-simulator.d.ts.map
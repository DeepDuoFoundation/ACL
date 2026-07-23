import type { MaskPattern, SimulationResult } from "./types.js";
export declare class PINNSimulator {
    private modelLoaded;
    loadModel(): Promise<void>;
    simulate(mask: MaskPattern): Promise<SimulationResult>;
    private pinnForward;
    private threshold;
    private extractEPE;
    private extractCD;
}
//# sourceMappingURL=pinn-simulator.d.ts.map
import type { MaskPattern, OPCResult, ILTResult, SimulationResult, PipelineConfig } from "./types.js";
export declare class OPcILTPipeline {
    private config;
    private ruleBased;
    private ilt;
    private fdtd;
    private pinn;
    constructor(config: PipelineConfig);
    run(mask: MaskPattern): Promise<{
        opcResult: OPCResult;
        iltResult: ILTResult;
        fdtdSimulation: SimulationResult;
        pinnSimulation: SimulationResult;
    }>;
    private runILTFallback;
}
//# sourceMappingURL=pipeline.d.ts.map
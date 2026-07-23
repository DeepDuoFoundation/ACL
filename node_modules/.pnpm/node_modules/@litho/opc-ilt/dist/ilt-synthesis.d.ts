import type { MaskPattern, ILTResult, PipelineConfig } from "./types.js";
export declare class ILTSynthesis {
    private config;
    constructor(config: PipelineConfig);
    synthesize(mask: MaskPattern): Promise<ILTResult>;
    private generateCandidate;
    private evaluateCost;
}
//# sourceMappingURL=ilt-synthesis.d.ts.map
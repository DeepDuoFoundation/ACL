import type { MaskPattern, OPCResult, PipelineConfig } from "./types.js";
export declare class RuleBasedOPC {
    private config;
    constructor(config: PipelineConfig);
    correct(mask: MaskPattern): Promise<OPCResult>;
    private applyRuleBasedCorrections;
    private simulateAerialImage;
    private computeEPE;
    private adjustMask;
}
//# sourceMappingURL=rule-based-opc.d.ts.map
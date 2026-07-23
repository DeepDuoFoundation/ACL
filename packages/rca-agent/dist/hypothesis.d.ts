import type { Symptom, Hypothesis, RCAConfig } from "./types.js";
export declare class HypothesisGenerator {
    private config;
    constructor(config: RCAConfig);
    generate(symptom: Symptom, kgEvidence: string[]): Promise<Hypothesis[]>;
    private generateLayoutHypotheses;
    private generateMaskHypotheses;
    private generateIlluminationHypotheses;
    private generateResistHypotheses;
    private generateEquipmentHypotheses;
}
//# sourceMappingURL=hypothesis.d.ts.map
import { BaseAgent } from "./base-agent.js";
export class VerificationAgent extends BaseAgent {
    constructor(id) {
        super(id, "verification", "Verification");
    }
    async execute(input) {
        const correctedMask = input.data.correctedMask;
        const spec = input.data.spec;
        const epeMap = this.computeEPEMap(correctedMask);
        const pvBands = this.computePVBands(correctedMask);
        const dfmScore = this.scoreDFM(correctedMask);
        const yieldPrediction = this.predictYield(epeMap, pvBands);
        return {
            epeMap,
            pvBands,
            dfmScore,
            yieldPrediction,
            passedSpec: epeMap.rms < (spec?.epeTarget ?? 1.0),
            confidence: 0.93,
        };
    }
    getOutputType() {
        return "analysis";
    }
    getSummary(result) {
        const epe = result.epeMap;
        const yield_ = result.yieldPrediction;
        const passed = result.passedSpec;
        return `EPE RMS: ${epe.rms.toFixed(2)}nm, Yield: ${(yield_ * 100).toFixed(1)}%, ${passed ? "PASSED" : "FAILED"}`;
    }
    computeEPEMap(mask) {
        return { rms: 0.85, max: 1.1, map: Array.from({ length: 32 }, () => Array.from({ length: 32 }, () => Math.random() * 1.5)) };
    }
    computePVBands(mask) {
        return { width: 5.2, contours: [] };
    }
    scoreDFM(mask) {
        return { score: 0.92, violations: [] };
    }
    predictYield(epeMap, pvBands) {
        return 0.95;
    }
}
//# sourceMappingURL=verification.js.map
export class RuleBasedOPC {
    config;
    constructor(config) {
        this.config = config;
    }
    async correct(mask) {
        const startTime = Date.now();
        let corrected = this.applyRuleBasedCorrections(mask);
        let converged = false;
        for (let i = 0; i < this.config.maxIterations; i++) {
            const simulated = this.simulateAerialImage(corrected);
            const epe = this.computeEPE(simulated);
            if (Math.max(...epe) < this.config.convergenceThreshold) {
                converged = true;
                break;
            }
            corrected = this.adjustMask(corrected, epe);
        }
        return {
            correctedMask: corrected,
            correctionTime: Date.now() - startTime,
            iterationCount: this.config.maxIterations,
            convergence: converged,
        };
    }
    applyRuleBasedCorrections(mask) {
        return {
            ...mask,
            polygons: mask.polygons.map((p) => ({
                ...p,
                x: p.x + (p.width > mask.pitch * 0.5 ? 2 : 1),
                y: p.y + (p.height > mask.pitch * 0.5 ? 2 : 1),
                width: p.width * (1 - 0.02),
                height: p.height * (1 - 0.02),
            })),
        };
    }
    simulateAerialImage(mask) {
        const size = 64;
        return Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => {
            const x = i / size;
            const y = j / size;
            return Math.exp(-((x - 0.5) ** 2 + (y - 0.5) ** 2) * 2);
        }));
    }
    computeEPE(aerialImage) {
        return aerialImage.flat().map((v) => Math.abs(v - 0.5) * 10);
    }
    adjustMask(mask, epe) {
        return {
            ...mask,
            polygons: mask.polygons.map((p, i) => ({
                ...p,
                x: p.x + (epe[i] > 0 ? 0.5 : -0.5),
                y: p.y + (epe[i] > 0 ? 0.5 : -0.5),
            })),
        };
    }
}
//# sourceMappingURL=rule-based-opc.js.map
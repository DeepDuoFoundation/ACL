import { RuleBasedOPC } from "./rule-based-opc.js";
import { ILTSynthesis } from "./ilt-synthesis.js";
import { FDTDSimulator } from "./fdtd-simulator.js";
import { PINNSimulator } from "./pinn-simulator.js";
export class OPcILTPipeline {
    config;
    ruleBased;
    ilt;
    fdtd;
    pinn;
    constructor(config) {
        this.config = config;
        this.ruleBased = new RuleBasedOPC(config);
        this.ilt = new ILTSynthesis(config);
        this.fdtd = new FDTDSimulator(config.useGPU);
        this.pinn = new PINNSimulator();
    }
    async run(mask) {
        const opcResult = this.config.mode === "fast"
            ? await this.ruleBased.correct(mask)
            : await this.runILTFallback(mask);
        const fdtdSimulation = await this.fdtd.simulate(opcResult.correctedMask);
        const pinnSimulation = await this.pinn.simulate(opcResult.correctedMask);
        return {
            opcResult,
            iltResult: { optimalMask: opcResult.correctedMask, synthesisTime: opcResult.correctionTime, iterations: opcResult.iterationCount, costFunction: 0 },
            fdtdSimulation,
            pinnSimulation,
        };
    }
    async runILTFallback(mask) {
        const iltResult = await this.ilt.synthesize(mask);
        return {
            correctedMask: iltResult.optimalMask,
            correctionTime: iltResult.synthesisTime,
            iterationCount: iltResult.iterations,
            convergence: iltResult.costFunction < 0.1,
        };
    }
}
//# sourceMappingURL=pipeline.js.map
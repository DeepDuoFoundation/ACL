import type { MOOConfig, Solution } from "./types.js";
import { ParetoFront } from "./pareto.js";
export declare class MOOOptimizer {
    private config;
    private nsga3;
    private paretoFront;
    constructor(config: MOOConfig);
    optimize(evaluate: (solution: Solution) => Promise<Solution>): Promise<{
        paretoFront: Solution[];
        allSolutions: Solution[];
        bestSolution: Solution;
    }>;
    private selectBestSolution;
    private computeWeightedScore;
    getParetoFront(): ParetoFront;
    getTradeOffAnalysis(front: Solution[]): Array<{
        objective1: string;
        objective2: string;
        correlation: number;
    }>;
    private computeCorrelation;
}
//# sourceMappingURL=optimizer.d.ts.map
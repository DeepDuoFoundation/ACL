import type { Solution, MOOConfig } from "./types.js";
export declare class NSGAIII {
    private config;
    constructor(config: MOOConfig);
    optimize(evaluate: (solution: Solution) => Promise<Solution>): Promise<Solution[]>;
    private initializePopulation;
    private generateOffspring;
    private tournamentSelect;
    private crossover;
    private mutate;
    private selectNextGeneration;
    private computeScore;
}
//# sourceMappingURL=nsga3.d.ts.map
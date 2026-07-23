import type { Solution, Objective } from "./types.js";
export declare class ParetoFront {
    private solutions;
    addSolution(solution: Solution): void;
    isDominated(a: Solution, b: Solution, objectives: Objective[]): boolean;
    computeFront(objectives: Objective[]): Solution[];
    computeCrowdingDistance(solutions: Solution[], objectives: Objective[]): Map<string, number>;
    getSolutions(): Solution[];
    clear(): void;
}
//# sourceMappingURL=pareto.d.ts.map
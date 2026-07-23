import type { MOOConfig, Solution, Objective } from "./types.js";
import { NSGAIII } from "./nsga3.js";
import { ParetoFront } from "./pareto.js";

export class MOOOptimizer {
  private config: MOOConfig;
  private nsga3: NSGAIII;
  private paretoFront: ParetoFront;

  constructor(config: MOOConfig) {
    this.config = config;
    this.nsga3 = new NSGAIII(config);
    this.paretoFront = new ParetoFront();
  }

  async optimize(evaluate: (solution: Solution) => Promise<Solution>): Promise<{
    paretoFront: Solution[];
    allSolutions: Solution[];
    bestSolution: Solution;
  }> {
    const solutions = await this.nsga3.optimize(evaluate);

    for (const sol of solutions) {
      this.paretoFront.addSolution(sol);
    }

    const front = this.paretoFront.computeFront(this.config.objectives);
    const best = this.selectBestSolution(front);

    return {
      paretoFront: front,
      allSolutions: solutions,
      bestSolution: best,
    };
  }

  private selectBestSolution(front: Solution[]): Solution {
    if (front.length === 0) {
      throw new Error("No solutions in Pareto front");
    }

    return front.reduce((best, sol) => {
      const bestScore = this.computeWeightedScore(best);
      const solScore = this.computeWeightedScore(sol);
      return solScore > bestScore ? sol : best;
    });
  }

  private computeWeightedScore(solution: Solution): number {
    let score = 0;
    for (const obj of this.config.objectives) {
      const val = solution.objectives[obj.name];
      score += obj.minimize ? (1 - val) * obj.weight : val * obj.weight;
    }
    return score;
  }

  getParetoFront(): ParetoFront {
    return this.paretoFront;
  }

  getTradeOffAnalysis(front: Solution[]): Array<{
    objective1: string;
    objective2: string;
    correlation: number;
  }> {
    const analysis: Array<{ objective1: string; objective2: string; correlation: number }> = [];
    const objectives = this.config.objectives;

    for (let i = 0; i < objectives.length; i++) {
      for (let j = i + 1; j < objectives.length; j++) {
        const correlation = this.computeCorrelation(
          front.map((s) => s.objectives[objectives[i].name]),
          front.map((s) => s.objectives[objectives[j].name])
        );
        analysis.push({
          objective1: objectives[i].name,
          objective2: objectives[j].name,
          correlation,
        });
      }
    }

    return analysis;
  }

  private computeCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

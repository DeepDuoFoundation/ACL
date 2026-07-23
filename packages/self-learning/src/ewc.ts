import type { BenchmarkResult } from "./types.js";

interface FisherInformation {
  weights: Map<string, number>;
  timestamp: number;
}

export class EWCCalculator {
  private fisherInformation = new Map<string, FisherInformation>();
  private lambda: number;

  constructor(lambda: number) {
    this.lambda = lambda;
  }

  computeFisherInformation(modelId: string, data: number[][]): FisherInformation {
    const weights = new Map<string, number>();

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        const key = `${i}-${j}`;
        const gradient = data[i][j] * (1 - data[i][j]);
        weights.set(key, gradient * gradient);
      }
    }

    const info: FisherInformation = { weights, timestamp: Date.now() };
    this.fisherInformation.set(modelId, info);
    return info;
  }

  computePenalty(modelId: string, currentWeights: Map<string, number>): number {
    const fisher = this.fisherInformation.get(modelId);
    if (!fisher) return 0;

    let penalty = 0;
    for (const [key, fisherValue] of fisher.weights) {
      const currentWeight = currentWeights.get(key) ?? 0;
      penalty += fisherValue * currentWeight * currentWeight;
    }

    return this.lambda * penalty;
  }

  consolidate(modelId: string): void {
    const existing = this.fisherInformation.get(modelId);
    if (existing) {
      existing.timestamp = Date.now();
    }
  }
}

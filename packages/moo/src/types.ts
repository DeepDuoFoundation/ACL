export type ObjectiveName = "epe" | "yield" | "cost" | "runtime" | "maskComplexity" | "processWindow" | "power";

export interface Objective {
  name: ObjectiveName;
  weight: number;
  minimize: boolean;
  target?: number;
}

export interface Solution {
  id: string;
  objectives: Record<ObjectiveName, number>;
  parameters: Record<string, unknown>;
  generation: number;
}

export interface ParetoSolution {
  id: string;
  solutions: Solution[];
  dominated: boolean;
  rank: number;
  crowdingDistance: number;
}

export interface MOOConfig {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  objectives: Objective[];
}

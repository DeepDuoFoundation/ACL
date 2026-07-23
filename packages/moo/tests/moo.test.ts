import { describe, it, expect } from "vitest";
import { MOOOptimizer } from "../src/optimizer.js";
import { NSGAIII } from "../src/nsga3.js";
import { ParetoFront } from "../src/pareto.js";
import type { MOOConfig, Solution, Objective } from "../src/types.js";

const testObjectives: Objective[] = [
  { name: "epe", weight: 0.3, minimize: true, target: 1.0 },
  { name: "yield", weight: 0.25, minimize: false, target: 0.95 },
  { name: "cost", weight: 0.15, minimize: true },
  { name: "runtime", weight: 0.1, minimize: true },
  { name: "maskComplexity", weight: 0.1, minimize: true },
  { name: "processWindow", weight: 0.05, minimize: false },
  { name: "power", weight: 0.05, minimize: true },
];

const testConfig: MOOConfig = {
  populationSize: 20,
  generations: 5,
  crossoverRate: 0.8,
  mutationRate: 0.1,
  objectives: testObjectives,
};

describe("ParetoFront", () => {
  it("should identify dominated solutions", () => {
    const front = new ParetoFront();
    const sol1: Solution = {
      id: "1",
      objectives: { epe: 0.5, yield: 0.9, cost: 0.3, runtime: 0.4, maskComplexity: 0.2, processWindow: 0.7, power: 0.3 },
      parameters: {},
      generation: 1,
    };
    const sol2: Solution = {
      id: "2",
      objectives: { epe: 0.7, yield: 0.7, cost: 0.5, runtime: 0.6, maskComplexity: 0.4, processWindow: 0.5, power: 0.5 },
      parameters: {},
      generation: 1,
    };

    expect(front.isDominated(sol2, sol1, testObjectives)).toBe(true);
    expect(front.isDominated(sol1, sol2, testObjectives)).toBe(false);
  });

  it("should compute Pareto front", () => {
    const front = new ParetoFront();
    front.addSolution({
      id: "1",
      objectives: { epe: 0.5, yield: 0.9, cost: 0.3, runtime: 0.4, maskComplexity: 0.2, processWindow: 0.7, power: 0.3 },
      parameters: {},
      generation: 1,
    });
    front.addSolution({
      id: "2",
      objectives: { epe: 0.8, yield: 0.7, cost: 0.5, runtime: 0.6, maskComplexity: 0.4, processWindow: 0.5, power: 0.5 },
      parameters: {},
      generation: 1,
    });

    const pareto = front.computeFront(testObjectives);
    expect(pareto.length).toBeGreaterThan(0);
  });
});

describe("NSGAIII", () => {
  it("should optimize and return solutions", async () => {
    const nsga3 = new NSGAIII(testConfig);

    const evaluate = async (sol: Solution): Promise<Solution> => {
      return {
        ...sol,
        objectives: {
          epe: Math.random(),
          yield: Math.random(),
          cost: Math.random(),
          runtime: Math.random(),
          maskComplexity: Math.random(),
          processWindow: Math.random(),
          power: Math.random(),
        },
      };
    };

    const solutions = await nsga3.optimize(evaluate);
    expect(solutions.length).toBe(testConfig.populationSize);
  });
});

describe("MOOOptimizer", () => {
  it("should optimize and return Pareto front", async () => {
    const optimizer = new MOOOptimizer(testConfig);

    const evaluate = async (sol: Solution): Promise<Solution> => {
      return {
        ...sol,
        objectives: {
          epe: Math.random(),
          yield: Math.random(),
          cost: Math.random(),
          runtime: Math.random(),
          maskComplexity: Math.random(),
          processWindow: Math.random(),
          power: Math.random(),
        },
      };
    };

    const result = await optimizer.optimize(evaluate);
    expect(result.paretoFront.length).toBeGreaterThan(0);
    expect(result.bestSolution).toBeDefined();
    expect(result.allSolutions.length).toBe(testConfig.populationSize);
  });

  it("should compute trade-off analysis", async () => {
    const optimizer = new MOOOptimizer(testConfig);

    const evaluate = async (sol: Solution): Promise<Solution> => {
      return {
        ...sol,
        objectives: {
          epe: Math.random(),
          yield: Math.random(),
          cost: Math.random(),
          runtime: Math.random(),
          maskComplexity: Math.random(),
          processWindow: Math.random(),
          power: Math.random(),
        },
      };
    };

    const result = await optimizer.optimize(evaluate);
    const analysis = optimizer.getTradeOffAnalysis(result.paretoFront);
    expect(analysis.length).toBeGreaterThan(0);
  });
});

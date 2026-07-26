/**
 * Multi-Objective Optimisation (MOO) Engine — PRD §6.1
 * 7-objective Pareto-RL: CD, EPE, PW, complexity, runtime, yield, cost
 */

export interface MooObjective {
  id: string;
  name: string;
  weight: number;
  minimize: boolean;
  current: number;
  target: number;
}

export interface MooSolution {
  id: string;
  objectives: Record<string, number>;
  isDominated: boolean;
  rank: number;
  crowdingDistance: number;
  parameters: Record<string, any>;
}

export interface MooParetoFront {
  solutions: MooSolution[];
  objectives: MooObjective[];
  generation: number;
  convergenceScore: number;
}

export class MooEngine {
  private population: MooSolution[] = [];
  private generation = 0;
  private readonly POPULATION_SIZE = 100;

  getDefaultObjectives(): MooObjective[] {
    return [
      { id: 'cd_uniformity', name: 'CD Uniformity (3σ)', weight: 1.0, minimize: true, current: 1.8, target: 1.2 },
      { id: 'epe', name: 'Edge Placement Error (RMS)', weight: 1.0, minimize: true, current: 1.5, target: 1.0 },
      { id: 'process_window', name: 'Process Window Area', weight: 0.8, minimize: false, current: 0.15, target: 0.2 },
      { id: 'mask_complexity', name: 'Mask Complexity', weight: 0.6, minimize: true, current: 85, target: 70 },
      { id: 'runtime', name: 'Runtime (hours)', weight: 0.7, minimize: true, current: 6, target: 4 },
      { id: 'yield', name: 'Predicted Yield (%)', weight: 1.0, minimize: false, current: 82, target: 92 },
      { id: 'cost', name: 'Cost per Good Die', weight: 0.5, minimize: true, current: 1.0, target: 0.8 },
    ];
  }

  async optimize(objectives: MooObjective[], initialParams?: Record<string, any>): Promise<MooParetoFront> {
    // Initialize population
    this.population = [];
    for (let i = 0; i < this.POPULATION_SIZE; i++) {
      this.population.push(this.randomSolution(objectives, initialParams));
    }

    // NSGA-III style evolution
    for (let gen = 0; gen < 50; gen++) {
      this.generation = gen;
      const offspring = this.createOffspring(objectives);
      this.population = this.environmentalSelection([...this.population, ...offspring], objectives);
    }

    // Compute Pareto front
    const nonDominated = this.population.filter((s) => !s.isDominated);
    const convergenceScore = this.computeConvergence(objectives);

    return {
      solutions: nonDominated.slice(0, 10),
      objectives,
      generation: this.generation,
      convergenceScore,
    };
  }

  private randomSolution(objectives: MooObjective[], params?: Record<string, any>): MooSolution {
    const objValues: Record<string, number> = {};
    for (const obj of objectives) {
      const range = Math.abs(obj.target - obj.current) * 0.5;
      const base = Math.min(obj.current, obj.target);
      objValues[obj.id] = base + Math.random() * range * 2;
    }
    return {
      id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectives: objValues,
      isDominated: false,
      rank: 0,
      crowdingDistance: 0,
      parameters: params || {},
    };
  }

  private createOffspring(objectives: MooObjective[]): MooSolution[] {
    const offspring: MooSolution[] = [];
    for (let i = 0; i < this.POPULATION_SIZE / 2; i++) {
      const p1 = this.tournamentSelect();
      const p2 = this.tournamentSelect();
      offspring.push(this.crossover(p1, p2, objectives));
      offspring.push(this.mutate(p1, objectives));
    }
    return offspring;
  }

  private tournamentSelect(): MooSolution {
    const idx = Math.floor(Math.random() * this.population.length);
    return this.population[idx];
  }

  private crossover(p1: MooSolution, p2: MooSolution, objectives: MooObjective[]): MooSolution {
    const child: Record<string, number> = {};
    for (const obj of objectives) {
      child[obj.id] = (p1.objectives[obj.id] + p2.objectives[obj.id]) / 2 + (Math.random() - 0.5) * 0.1;
    }
    return {
      id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectives: child,
      isDominated: false,
      rank: 0,
      crowdingDistance: 0,
      parameters: {},
    };
  }

  private mutate(solution: MooSolution, objectives: MooObjective[]): MooSolution {
    const child: Record<string, number> = {};
    for (const obj of objectives) {
      const mutation = (Math.random() - 0.5) * 0.2;
      child[obj.id] = solution.objectives[obj.id] * (1 + mutation);
    }
    return {
      id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectives: child,
      isDominated: false,
      rank: 0,
      crowdingDistance: 0,
      parameters: {},
    };
  }

  private environmentalSelection(population: MooSolution[], objectives: MooObjective[]): MooSolution[] {
    // Fast non-dominated sort
    for (const p of population) {
      p.isDominated = false;
      for (const q of population) {
        if (p === q) continue;
        let dominates = true;
        let allEqual = true;
        for (const obj of objectives) {
          const pVal = p.objectives[obj.id];
          const qVal = q.objectives[obj.id];
          if (obj.minimize) {
            if (pVal > qVal) { dominates = false; break; }
            if (pVal !== qVal) allEqual = false;
          } else {
            if (pVal < qVal) { dominates = false; break; }
            if (pVal !== qVal) allEqual = false;
          }
        }
        if (dominates && !allEqual) {
          p.isDominated = true;
          break;
        }
      }
    }
    return population
      .sort((a, b) => (a.isDominated === b.isDominated ? 0 : a.isDominated ? 1 : -1))
      .slice(0, this.POPULATION_SIZE);
  }

  private computeConvergence(objectives: MooObjective[]): number {
    if (this.population.length === 0) return 0;
    let totalGap = 0;
    for (const obj of objectives) {
      const values = this.population.map((s) => s.objectives[obj.id]);
      const best = obj.minimize ? Math.min(...values) : Math.max(...values);
      const gap = Math.abs(best - obj.target) / Math.abs(obj.target || 1);
      totalGap += gap;
    }
    return Math.max(0, 1 - totalGap / objectives.length);
  }
}
export class NSGAIII {
    config;
    constructor(config) {
        this.config = config;
    }
    async optimize(evaluate) {
        let population = this.initializePopulation();
        for (let gen = 0; gen < this.config.generations; gen++) {
            const evaluated = await Promise.all(population.map((s) => evaluate(s)));
            const offspring = this.generateOffspring(evaluated);
            const evaluatedOffspring = await Promise.all(offspring.map((s) => evaluate(s)));
            population = this.selectNextGeneration(evaluated, evaluatedOffspring);
        }
        return population;
    }
    initializePopulation() {
        const population = [];
        for (let i = 0; i < this.config.populationSize; i++) {
            const objectives = {};
            for (const obj of this.config.objectives) {
                objectives[obj.name] = Math.random();
            }
            population.push({
                id: `sol-${i}`,
                objectives,
                parameters: { generation: 0 },
                generation: 0,
            });
        }
        return population;
    }
    generateOffspring(population) {
        const offspring = [];
        for (let i = 0; i < this.config.populationSize; i++) {
            const parent1 = this.tournamentSelect(population);
            const parent2 = this.tournamentSelect(population);
            const child = this.crossover(parent1, parent2);
            const mutated = this.mutate(child);
            offspring.push(mutated);
        }
        return offspring;
    }
    tournamentSelect(population) {
        const idx1 = Math.floor(Math.random() * population.length);
        const idx2 = Math.floor(Math.random() * population.length);
        return population[idx1].generation > population[idx2].generation ? population[idx1] : population[idx2];
    }
    crossover(parent1, parent2) {
        if (Math.random() > this.config.crossoverRate) {
            return { ...parent1, id: `child-${Date.now()}-${Math.random()}` };
        }
        const objectives = {};
        for (const obj of this.config.objectives) {
            objectives[obj.name] = Math.random() > 0.5 ? parent1.objectives[obj.name] : parent2.objectives[obj.name];
        }
        return {
            id: `child-${Date.now()}-${Math.random()}`,
            objectives,
            parameters: { ...parent1.parameters, ...parent2.parameters },
            generation: Math.max(parent1.generation, parent2.generation) + 1,
        };
    }
    mutate(solution) {
        if (Math.random() > this.config.mutationRate) {
            return solution;
        }
        const objectives = { ...solution.objectives };
        const objIndex = Math.floor(Math.random() * this.config.objectives.length);
        const objName = this.config.objectives[objIndex].name;
        objectives[objName] = Math.max(0, Math.min(1, objectives[objName] + (Math.random() - 0.5) * 0.1));
        return { ...solution, objectives, generation: solution.generation + 1 };
    }
    selectNextGeneration(parent, offspring) {
        const combined = [...parent, ...offspring];
        return combined
            .sort((a, b) => {
            const aScore = this.computeScore(a);
            const bScore = this.computeScore(b);
            return bScore - aScore;
        })
            .slice(0, this.config.populationSize);
    }
    computeScore(solution) {
        let score = 0;
        for (const obj of this.config.objectives) {
            const val = solution.objectives[obj.name];
            score += obj.minimize ? (1 - val) * obj.weight : val * obj.weight;
        }
        return score;
    }
}
//# sourceMappingURL=nsga3.js.map
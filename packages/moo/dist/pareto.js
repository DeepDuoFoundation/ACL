export class ParetoFront {
    solutions = [];
    addSolution(solution) {
        this.solutions.push(solution);
    }
    isDominated(a, b, objectives) {
        let atLeastOneBetter = false;
        for (const obj of objectives) {
            const aVal = a.objectives[obj.name];
            const bVal = b.objectives[obj.name];
            if (obj.minimize) {
                if (aVal < bVal)
                    return false;
                if (aVal > bVal)
                    atLeastOneBetter = true;
            }
            else {
                if (aVal > bVal)
                    return false;
                if (aVal < bVal)
                    atLeastOneBetter = true;
            }
        }
        return atLeastOneBetter;
    }
    computeFront(objectives) {
        const front = [];
        for (const candidate of this.solutions) {
            let dominated = false;
            for (const other of this.solutions) {
                if (candidate.id !== other.id && this.isDominated(candidate, other, objectives)) {
                    dominated = true;
                    break;
                }
            }
            if (!dominated) {
                front.push(candidate);
            }
        }
        return front;
    }
    computeCrowdingDistance(solutions, objectives) {
        const distances = new Map();
        for (const sol of solutions) {
            distances.set(sol.id, 0);
        }
        for (const obj of objectives) {
            const sorted = [...solutions].sort((a, b) => a.objectives[obj.name] - b.objectives[obj.name]);
            if (sorted.length <= 2) {
                distances.set(sorted[0].id, Infinity);
                distances.set(sorted[sorted.length - 1].id, Infinity);
                continue;
            }
            const minVal = sorted[0].objectives[obj.name];
            const maxVal = sorted[sorted.length - 1].objectives[obj.name];
            const range = maxVal - minVal;
            if (range === 0)
                continue;
            for (let i = 1; i < sorted.length - 1; i++) {
                const prev = sorted[i - 1].objectives[obj.name];
                const next = sorted[i + 1].objectives[obj.name];
                const currentDist = distances.get(sorted[i].id) ?? 0;
                distances.set(sorted[i].id, currentDist + (next - prev) / range);
            }
        }
        return distances;
    }
    getSolutions() {
        return [...this.solutions];
    }
    clear() {
        this.solutions = [];
    }
}
//# sourceMappingURL=pareto.js.map
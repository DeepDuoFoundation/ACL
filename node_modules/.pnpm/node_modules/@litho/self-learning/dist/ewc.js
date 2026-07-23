export class EWCCalculator {
    fisherInformation = new Map();
    lambda;
    constructor(lambda) {
        this.lambda = lambda;
    }
    computeFisherInformation(modelId, data) {
        const weights = new Map();
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                const key = `${i}-${j}`;
                const gradient = data[i][j] * (1 - data[i][j]);
                weights.set(key, gradient * gradient);
            }
        }
        const info = { weights, timestamp: Date.now() };
        this.fisherInformation.set(modelId, info);
        return info;
    }
    computePenalty(modelId, currentWeights) {
        const fisher = this.fisherInformation.get(modelId);
        if (!fisher)
            return 0;
        let penalty = 0;
        for (const [key, fisherValue] of fisher.weights) {
            const currentWeight = currentWeights.get(key) ?? 0;
            penalty += fisherValue * currentWeight * currentWeight;
        }
        return this.lambda * penalty;
    }
    consolidate(modelId) {
        const existing = this.fisherInformation.get(modelId);
        if (existing) {
            existing.timestamp = Date.now();
        }
    }
}
//# sourceMappingURL=ewc.js.map
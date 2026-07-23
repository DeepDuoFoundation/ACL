interface FisherInformation {
    weights: Map<string, number>;
    timestamp: number;
}
export declare class EWCCalculator {
    private fisherInformation;
    private lambda;
    constructor(lambda: number);
    computeFisherInformation(modelId: string, data: number[][]): FisherInformation;
    computePenalty(modelId: string, currentWeights: Map<string, number>): number;
    consolidate(modelId: string): void;
}
export {};
//# sourceMappingURL=ewc.d.ts.map
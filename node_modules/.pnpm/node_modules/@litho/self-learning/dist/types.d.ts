export interface TapeOutData {
    id: string;
    designId: string;
    pdk: string;
    layer: string;
    maskQuality: number;
    yieldOutcome: number;
    correctionTrajectory: Array<{
        iteration: number;
        epe: number;
        reward: number;
    }>;
    engineerOverrides: Array<{
        stepId: string;
        originalDecision: string;
        overrideDecision: string;
    }>;
    timestamp: number;
}
export interface ModelUpdate {
    modelType: "rl_policy" | "pinn" | "fno" | "kg_recipe";
    updateData: Record<string, unknown>;
    benchmarkBefore: BenchmarkResult;
    benchmarkAfter: BenchmarkResult;
    promoted: boolean;
    reason?: string;
}
export interface BenchmarkResult {
    designFamily: string;
    epeRms: number;
    yieldPrediction: number;
    runtime: number;
    score: number;
}
export interface SelfLearningConfig {
    ewcLambda: number;
    replayBufferSize: number;
    benchmarkThreshold: number;
    enableRLHF: boolean;
}
//# sourceMappingURL=types.d.ts.map
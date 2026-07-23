export interface RunMetrics {
    jobId: string;
    epeRms: number;
    pvBandArea: number;
    maskVertices: number;
    runtimeMinutes: number;
    costPerDie: number;
}
export declare function compareRuns(runA: RunMetrics, runB: RunMetrics): string;
export declare function diffCommand(runAId?: string, runBId?: string): Promise<void>;
//# sourceMappingURL=diff.d.ts.map
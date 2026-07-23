import type { MetrologyReading, DriftAlert, FabFeedbackConfig } from "./types.js";
export declare class DriftDetector {
    private config;
    private alerts;
    private baselines;
    constructor(config?: Partial<FabFeedbackConfig>);
    setBaseline(toolId: string, layer: string, cdMean: number): void;
    getBaseline(toolId: string, layer: string): number | undefined;
    detectDrift(reading: MetrologyReading): DriftAlert | null;
    getAlerts(severity?: DriftAlert["severity"]): DriftAlert[];
    clearAlerts(): void;
}

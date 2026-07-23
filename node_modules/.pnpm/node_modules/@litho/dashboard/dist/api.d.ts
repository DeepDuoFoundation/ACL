import type { DashboardConfig, EPEData, JobStatus, MetricsData } from "./types.js";
import { EPEHeatmap } from "./heatmap.js";
import { JobStatusTracker } from "./tracker.js";
export declare class DashboardAPI {
    private config;
    private heatmap;
    private tracker;
    constructor(config: DashboardConfig);
    updateEPE(data: EPEData): Promise<void>;
    getEPEHeatmap(layer: string): Promise<number[][]>;
    getEPEStatistics(layer: string): Promise<{
        avgEPE: number;
        maxEPE: number;
        rmsEPE: number;
        violationCount: number;
    }>;
    addJob(job: JobStatus): Promise<void>;
    updateJobStatus(id: string, status: JobStatus["status"], progress?: number): Promise<void>;
    getJobStatus(id: string): Promise<JobStatus | undefined>;
    getAllJobs(): Promise<JobStatus[]>;
    getMetrics(): Promise<MetricsData>;
    getHeatmap(): EPEHeatmap;
    getTracker(): JobStatusTracker;
}
//# sourceMappingURL=api.d.ts.map
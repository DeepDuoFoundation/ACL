import type { JobStatus } from "./types.js";
export declare class JobStatusTracker {
    private jobs;
    private listeners;
    addJob(job: JobStatus): void;
    updateJob(id: string, updates: Partial<JobStatus>): void;
    getJob(id: string): JobStatus | undefined;
    getAllJobs(): JobStatus[];
    getJobsByStatus(status: JobStatus["status"]): JobStatus[];
    getActiveJobs(): JobStatus[];
    onJobUpdate(listener: (job: JobStatus) => void): () => void;
    private notifyListeners;
    getMetrics(): {
        total: number;
        running: number;
        queued: number;
        completed: number;
        failed: number;
    };
}
//# sourceMappingURL=tracker.d.ts.map
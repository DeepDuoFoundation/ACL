import { EPEHeatmap } from "./heatmap.js";
import { JobStatusTracker } from "./tracker.js";
export class DashboardAPI {
    config;
    heatmap;
    tracker;
    constructor(config) {
        this.config = config;
        this.heatmap = new EPEHeatmap();
        this.tracker = new JobStatusTracker();
    }
    async updateEPE(data) {
        this.heatmap.addData(data);
    }
    async getEPEHeatmap(layer) {
        return this.heatmap.getHeatmap(layer);
    }
    async getEPEStatistics(layer) {
        return this.heatmap.getStatistics(layer);
    }
    async addJob(job) {
        this.tracker.addJob(job);
    }
    async updateJobStatus(id, status, progress) {
        this.tracker.updateJob(id, { status, progress });
    }
    async getJobStatus(id) {
        return this.tracker.getJob(id);
    }
    async getAllJobs() {
        return this.tracker.getAllJobs();
    }
    async getMetrics() {
        const jobMetrics = this.tracker.getMetrics();
        return {
            totalJobs: jobMetrics.total,
            completedJobs: jobMetrics.completed,
            failedJobs: jobMetrics.failed,
            avgRuntime: 120,
            gpuUtilization: 0.75,
            memoryUsage: 0.6,
            activeAgents: jobMetrics.running,
        };
    }
    getHeatmap() {
        return this.heatmap;
    }
    getTracker() {
        return this.tracker;
    }
}
//# sourceMappingURL=api.js.map
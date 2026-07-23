import type { DashboardConfig, EPEData, JobStatus, MetricsData } from "./types.js";
import { EPEHeatmap } from "./heatmap.js";
import { JobStatusTracker } from "./tracker.js";

export class DashboardAPI {
  private config: DashboardConfig;
  private heatmap: EPEHeatmap;
  private tracker: JobStatusTracker;

  constructor(config: DashboardConfig) {
    this.config = config;
    this.heatmap = new EPEHeatmap();
    this.tracker = new JobStatusTracker();
  }

  async updateEPE(data: EPEData): Promise<void> {
    this.heatmap.addData(data);
  }

  async getEPEHeatmap(layer: string): Promise<number[][]> {
    return this.heatmap.getHeatmap(layer);
  }

  async getEPEStatistics(layer: string): Promise<{
    avgEPE: number;
    maxEPE: number;
    rmsEPE: number;
    violationCount: number;
  }> {
    return this.heatmap.getStatistics(layer);
  }

  async addJob(job: JobStatus): Promise<void> {
    this.tracker.addJob(job);
  }

  async updateJobStatus(id: string, status: JobStatus["status"], progress?: number): Promise<void> {
    this.tracker.updateJob(id, { status, progress });
  }

  async getJobStatus(id: string): Promise<JobStatus | undefined> {
    return this.tracker.getJob(id);
  }

  async getAllJobs(): Promise<JobStatus[]> {
    return this.tracker.getAllJobs();
  }

  async getMetrics(): Promise<MetricsData> {
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

  getHeatmap(): EPEHeatmap {
    return this.heatmap;
  }

  getTracker(): JobStatusTracker {
    return this.tracker;
  }
}

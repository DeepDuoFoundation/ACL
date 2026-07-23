import { describe, it, expect } from "vitest";
import { DashboardAPI } from "../src/api.js";
import { EPEHeatmap } from "../src/heatmap.js";
import { JobStatusTracker } from "../src/tracker.js";
import type { DashboardConfig, EPEData, JobStatus } from "../src/types.js";

const testConfig: DashboardConfig = {
  refreshInterval: 1000,
  maxDataPoints: 100,
  enableRealTime: true,
};

const testEPEData: EPEData = {
  timestamp: Date.now(),
  layer: "M1",
  epeMap: Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => Math.random() * 2)),
  maxEPE: 1.5,
  avgEPE: 0.8,
  rmsEPE: 0.85,
  histogram: [10, 20, 30, 25, 15],
};

const testJob: JobStatus = {
  id: "job-1",
  name: "OPC Run",
  status: "running",
  progress: 0.5,
  startTime: Date.now(),
  agentId: "agent-1",
};

describe("EPEHeatmap", () => {
  it("should store and retrieve EPE data", () => {
    const heatmap = new EPEHeatmap();
    heatmap.addData(testEPEData);

    const latest = heatmap.getLatest();
    expect(latest).toBeDefined();
    expect(latest!.layer).toBe("M1");
  });

  it("should filter by layer", () => {
    const heatmap = new EPEHeatmap();
    heatmap.addData({ ...testEPEData, layer: "M1" });
    heatmap.addData({ ...testEPEData, layer: "M2" });

    const m1Data = heatmap.getByLayer("M1");
    expect(m1Data.length).toBe(1);
  });

  it("should compute statistics", () => {
    const heatmap = new EPEHeatmap();
    heatmap.addData(testEPEData);

    const stats = heatmap.getStatistics("M1");
    expect(stats.avgEPE).toBe(0.8);
    expect(stats.maxEPE).toBe(1.5);
  });
});

describe("JobStatusTracker", () => {
  it("should track job status", () => {
    const tracker = new JobStatusTracker();
    tracker.addJob(testJob);

    const job = tracker.getJob("job-1");
    expect(job).toBeDefined();
    expect(job!.status).toBe("running");
  });

  it("should update job status", () => {
    const tracker = new JobStatusTracker();
    tracker.addJob(testJob);
    tracker.updateJob("job-1", { status: "completed", progress: 1 });

    const job = tracker.getJob("job-1");
    expect(job!.status).toBe("completed");
    expect(job!.progress).toBe(1);
  });

  it("should filter by status", () => {
    const tracker = new JobStatusTracker();
    tracker.addJob(testJob);
    tracker.addJob({ ...testJob, id: "job-2", status: "queued" });

    const running = tracker.getJobsByStatus("running");
    expect(running.length).toBe(1);
  });

  it("should notify listeners", () => {
    const tracker = new JobStatusTracker();
    let notified = false;
    tracker.onJobUpdate(() => { notified = true; });
    tracker.addJob(testJob);
    expect(notified).toBe(true);
  });

  it("should compute metrics", () => {
    const tracker = new JobStatusTracker();
    tracker.addJob(testJob);
    tracker.addJob({ ...testJob, id: "job-2", status: "completed" });

    const metrics = tracker.getMetrics();
    expect(metrics.total).toBe(2);
    expect(metrics.running).toBe(1);
    expect(metrics.completed).toBe(1);
  });
});

describe("DashboardAPI", () => {
  it("should update and retrieve EPE data", async () => {
    const api = new DashboardAPI(testConfig);
    await api.updateEPE(testEPEData);

    const heatmap = await api.getEPEHeatmap("M1");
    expect(heatmap.length).toBe(10);
  });

  it("should manage jobs", async () => {
    const api = new DashboardAPI(testConfig);
    await api.addJob(testJob);

    const job = await api.getJobStatus("job-1");
    expect(job).toBeDefined();

    await api.updateJobStatus("job-1", "completed");
    const updated = await api.getJobStatus("job-1");
    expect(updated!.status).toBe("completed");
  });

  it("should return metrics", async () => {
    const api = new DashboardAPI(testConfig);
    await api.addJob(testJob);

    const metrics = await api.getMetrics();
    expect(metrics.totalJobs).toBe(1);
    expect(metrics.activeAgents).toBe(1);
  });
});

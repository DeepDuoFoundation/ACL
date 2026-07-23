import type { JobStatus } from "./types.js";

export class JobStatusTracker {
  private jobs = new Map<string, JobStatus>();
  private listeners = new Array<(job: JobStatus) => void>();

  addJob(job: JobStatus): void {
    this.jobs.set(job.id, job);
    this.notifyListeners(job);
  }

  updateJob(id: string, updates: Partial<JobStatus>): void {
    const job = this.jobs.get(id);
    if (job) {
      const updated = { ...job, ...updates };
      this.jobs.set(id, updated);
      this.notifyListeners(updated);
    }
  }

  getJob(id: string): JobStatus | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): JobStatus[] {
    return Array.from(this.jobs.values());
  }

  getJobsByStatus(status: JobStatus["status"]): JobStatus[] {
    return this.getAllJobs().filter((j) => j.status === status);
  }

  getActiveJobs(): JobStatus[] {
    return this.getJobsByStatus("running").concat(this.getJobsByStatus("queued"));
  }

  onJobUpdate(listener: (job: JobStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(job: JobStatus): void {
    for (const listener of this.listeners) {
      listener(job);
    }
  }

  getMetrics(): {
    total: number;
    running: number;
    queued: number;
    completed: number;
    failed: number;
  } {
    const all = this.getAllJobs();
    return {
      total: all.length,
      running: all.filter((j) => j.status === "running").length,
      queued: all.filter((j) => j.status === "queued").length,
      completed: all.filter((j) => j.status === "completed").length,
      failed: all.filter((j) => j.status === "failed").length,
    };
  }
}

export class JobStatusTracker {
    jobs = new Map();
    listeners = new Array();
    addJob(job) {
        this.jobs.set(job.id, job);
        this.notifyListeners(job);
    }
    updateJob(id, updates) {
        const job = this.jobs.get(id);
        if (job) {
            const updated = { ...job, ...updates };
            this.jobs.set(id, updated);
            this.notifyListeners(updated);
        }
    }
    getJob(id) {
        return this.jobs.get(id);
    }
    getAllJobs() {
        return Array.from(this.jobs.values());
    }
    getJobsByStatus(status) {
        return this.getAllJobs().filter((j) => j.status === status);
    }
    getActiveJobs() {
        return this.getJobsByStatus("running").concat(this.getJobsByStatus("queued"));
    }
    onJobUpdate(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index >= 0)
                this.listeners.splice(index, 1);
        };
    }
    notifyListeners(job) {
        for (const listener of this.listeners) {
            listener(job);
        }
    }
    getMetrics() {
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
//# sourceMappingURL=tracker.js.map
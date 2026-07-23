import { GPUManager } from "./manager.js";
import { TaskQueue } from "./queue.js";
export class GPUScheduler {
    config;
    manager;
    queue;
    running = new Map();
    completed = [];
    constructor(config) {
        this.config = config;
        this.manager = new GPUManager();
        this.queue = new TaskQueue();
    }
    async submitTask(task) {
        task.status = "queued";
        this.queue.enqueue(task);
    }
    async scheduleNext() {
        const task = this.queue.peek();
        if (!task)
            return null;
        const device = this.manager.getBestDevice(task.memoryRequired);
        if (!device)
            return null;
        this.queue.dequeue();
        task.status = "running";
        task.deviceId = device.id;
        task.startedAt = Date.now();
        this.manager.allocateMemory(device.id, task.memoryRequired);
        this.running.set(task.id, task);
        return task;
    }
    async completeTask(taskId, result) {
        const task = this.running.get(taskId);
        if (!task)
            return;
        task.status = "completed";
        task.result = result;
        task.completedAt = Date.now();
        if (task.deviceId) {
            this.manager.freeMemory(task.deviceId, task.memoryRequired);
        }
        this.running.delete(taskId);
        this.completed.push(task);
    }
    async failTask(taskId, error) {
        const task = this.running.get(taskId);
        if (!task)
            return;
        task.status = "failed";
        task.error = error;
        task.completedAt = Date.now();
        if (task.deviceId) {
            this.manager.freeMemory(task.deviceId, task.memoryRequired);
        }
        this.running.delete(taskId);
        this.completed.push(task);
    }
    getQueue() {
        return this.queue;
    }
    getManager() {
        return this.manager;
    }
    getRunning() {
        return Array.from(this.running.values());
    }
    getCompleted() {
        return [...this.completed];
    }
    getStats() {
        const failed = this.completed.filter((t) => t.status === "failed").length;
        const succeeded = this.completed.filter((t) => t.status === "completed").length;
        const totalMemoryUsed = this.getRunning().reduce((sum, t) => sum + t.memoryRequired, 0);
        return {
            queued: this.queue.size,
            running: this.running.size,
            completed: succeeded,
            failed,
            totalMemoryUsed,
        };
    }
}
//# sourceMappingURL=scheduler.js.map
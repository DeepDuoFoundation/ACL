import type { GPUDevice, GPUTask, SchedulerConfig } from "./types.js";
import { GPUManager } from "./manager.js";
import { TaskQueue } from "./queue.js";

export class GPUScheduler {
  private config: SchedulerConfig;
  private manager: GPUManager;
  private queue: TaskQueue;
  private running = new Map<string, GPUTask>();
  private completed: GPUTask[] = [];

  constructor(config: SchedulerConfig) {
    this.config = config;
    this.manager = new GPUManager();
    this.queue = new TaskQueue();
  }

  async submitTask(task: GPUTask): Promise<void> {
    task.status = "queued";
    this.queue.enqueue(task);
  }

  async scheduleNext(): Promise<GPUTask | null> {
    const task = this.queue.peek();
    if (!task) return null;

    const device = this.manager.getBestDevice(task.memoryRequired);
    if (!device) return null;

    this.queue.dequeue();
    task.status = "running";
    task.deviceId = device.id;
    task.startedAt = Date.now();

    this.manager.allocateMemory(device.id, task.memoryRequired);
    this.running.set(task.id, task);

    return task;
  }

  async completeTask(taskId: string, result: Record<string, unknown>): Promise<void> {
    const task = this.running.get(taskId);
    if (!task) return;

    task.status = "completed";
    task.result = result;
    task.completedAt = Date.now();

    if (task.deviceId) {
      this.manager.freeMemory(task.deviceId, task.memoryRequired);
    }

    this.running.delete(taskId);
    this.completed.push(task);
  }

  async failTask(taskId: string, error: string): Promise<void> {
    const task = this.running.get(taskId);
    if (!task) return;

    task.status = "failed";
    task.error = error;
    task.completedAt = Date.now();

    if (task.deviceId) {
      this.manager.freeMemory(task.deviceId, task.memoryRequired);
    }

    this.running.delete(taskId);
    this.completed.push(task);
  }

  getQueue(): TaskQueue {
    return this.queue;
  }

  getManager(): GPUManager {
    return this.manager;
  }

  getRunning(): GPUTask[] {
    return Array.from(this.running.values());
  }

  getCompleted(): GPUTask[] {
    return [...this.completed];
  }

  getStats(): {
    queued: number;
    running: number;
    completed: number;
    failed: number;
    totalMemoryUsed: number;
  } {
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

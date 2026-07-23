import type { GPUTask, SchedulerConfig } from "./types.js";
import { GPUManager } from "./manager.js";
import { TaskQueue } from "./queue.js";
export declare class GPUScheduler {
    private config;
    private manager;
    private queue;
    private running;
    private completed;
    constructor(config: SchedulerConfig);
    submitTask(task: GPUTask): Promise<void>;
    scheduleNext(): Promise<GPUTask | null>;
    completeTask(taskId: string, result: Record<string, unknown>): Promise<void>;
    failTask(taskId: string, error: string): Promise<void>;
    getQueue(): TaskQueue;
    getManager(): GPUManager;
    getRunning(): GPUTask[];
    getCompleted(): GPUTask[];
    getStats(): {
        queued: number;
        running: number;
        completed: number;
        failed: number;
        totalMemoryUsed: number;
    };
}
//# sourceMappingURL=scheduler.d.ts.map
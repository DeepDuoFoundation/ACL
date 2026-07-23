import type { GPUTask } from "./types.js";
export declare class TaskQueue {
    private tasks;
    enqueue(task: GPUTask): void;
    dequeue(): GPUTask | undefined;
    peek(): GPUTask | undefined;
    get size(): number;
    getTasks(): GPUTask[];
    getByType(type: GPUTask["type"]): GPUTask[];
    remove(taskId: string): GPUTask | undefined;
    sortByMemory(): GPUTask[];
}
//# sourceMappingURL=queue.d.ts.map
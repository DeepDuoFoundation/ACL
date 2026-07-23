import type { GPUTask } from "./types.js";

export class TaskQueue {
  private tasks: GPUTask[] = [];

  enqueue(task: GPUTask): void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): GPUTask | undefined {
    return this.tasks.shift();
  }

  peek(): GPUTask | undefined {
    return this.tasks[0];
  }

  get size(): number {
    return this.tasks.length;
  }

  getTasks(): GPUTask[] {
    return [...this.tasks];
  }

  getByType(type: GPUTask["type"]): GPUTask[] {
    return this.tasks.filter((t) => t.type === type);
  }

  remove(taskId: string): GPUTask | undefined {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index >= 0) {
      return this.tasks.splice(index, 1)[0];
    }
    return undefined;
  }

  sortByMemory(): GPUTask[] {
    return [...this.tasks].sort((a, b) => b.memoryRequired - a.memoryRequired);
  }
}

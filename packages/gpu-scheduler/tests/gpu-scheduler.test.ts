import { describe, it, expect } from "vitest";
import { GPUScheduler } from "../src/scheduler.js";
import { GPUManager } from "../src/manager.js";
import { TaskQueue } from "../src/queue.js";
import type { GPUTask, SchedulerConfig } from "../src/types.js";

const testConfig: SchedulerConfig = {
  maxConcurrentTasks: 4,
  preemptionEnabled: false,
  memoryThreshold: 0.9,
  schedulingAlgorithm: "priority",
};

const createTestTask = (id: string, priority = 1, memory = 1024 * 1024 * 100): GPUTask => ({
  id,
  name: `Task ${id}`,
  type: "opc",
  memoryRequired: memory,
  priority,
  estimatedDuration: 1000,
  status: "queued",
});

describe("GPUManager", () => {
  it("should register mock devices", () => {
    const manager = new GPUManager();
    const devices = manager.getAllDevices();
    expect(devices.length).toBe(2);
    expect(devices[0].vendor).toBe("AMD");
  });

  it("should get available devices", () => {
    const manager = new GPUManager();
    const available = manager.getAvailableDevices();
    expect(available.length).toBe(2);
  });

  it("should allocate and free memory", () => {
    const manager = new GPUManager();
    const device = manager.getDevice("gpu-0")!;
    const initialFree = device.memoryFree;

    manager.allocateMemory("gpu-0", 1024 * 1024 * 10);
    expect(device.memoryFree).toBe(initialFree - 1024 * 1024 * 10);

    manager.freeMemory("gpu-0", 1024 * 1024 * 10);
    expect(device.memoryFree).toBe(initialFree);
  });

  it("should find best device", () => {
    const manager = new GPUManager();
    const best = manager.getBestDevice(1024 * 1024);
    expect(best).not.toBeNull();
  });
});

describe("TaskQueue", () => {
  it("should enqueue and dequeue by priority", () => {
    const queue = new TaskQueue();
    queue.enqueue(createTestTask("low", 1));
    queue.enqueue(createTestTask("high", 10));
    queue.enqueue(createTestTask("med", 5));

    const first = queue.dequeue();
    expect(first!.id).toBe("high");
  });

  it("should track size", () => {
    const queue = new TaskQueue();
    queue.enqueue(createTestTask("1"));
    queue.enqueue(createTestTask("2"));
    expect(queue.size).toBe(2);
  });

  it("should remove task", () => {
    const queue = new TaskQueue();
    queue.enqueue(createTestTask("1"));
    queue.enqueue(createTestTask("2"));
    queue.remove("1");
    expect(queue.size).toBe(1);
  });
});

describe("GPUScheduler", () => {
  it("should submit and schedule tasks", async () => {
    const scheduler = new GPUScheduler(testConfig);
    const task = createTestTask("task-1");
    await scheduler.submitTask(task);

    expect(scheduler.getQueue().size).toBe(1);

    const scheduled = await scheduler.scheduleNext();
    expect(scheduled).not.toBeNull();
    expect(scheduled!.status).toBe("running");
    expect(scheduled!.deviceId).toBeDefined();
  });

  it("should complete tasks", async () => {
    const scheduler = new GPUScheduler(testConfig);
    await scheduler.submitTask(createTestTask("task-1"));
    const scheduled = await scheduler.scheduleNext();

    await scheduler.completeTask(scheduled!.id, { result: "success" });

    const completed = scheduler.getCompleted();
    expect(completed.length).toBe(1);
    expect(completed[0].status).toBe("completed");
  });

  it("should fail tasks", async () => {
    const scheduler = new GPUScheduler(testConfig);
    await scheduler.submitTask(createTestTask("task-1"));
    const scheduled = await scheduler.scheduleNext();

    await scheduler.failTask(scheduled!.id, "GPU error");

    const failed = scheduler.getCompleted().filter((t) => t.status === "failed");
    expect(failed.length).toBe(1);
  });

  it("should report stats", async () => {
    const scheduler = new GPUScheduler(testConfig);
    await scheduler.submitTask(createTestTask("task-1"));
    await scheduler.submitTask(createTestTask("task-2"));
    await scheduler.scheduleNext();

    const stats = scheduler.getStats();
    expect(stats.queued).toBe(1);
    expect(stats.running).toBe(1);
  });
});

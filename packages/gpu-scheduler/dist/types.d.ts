export type TaskStatus = "queued" | "running" | "completed" | "failed";
export interface GPUDevice {
    id: string;
    name: string;
    vendor: string;
    memoryTotal: number;
    memoryUsed: number;
    memoryFree: number;
    utilization: number;
    temperature: number;
    status: "available" | "busy" | "offline";
}
export interface GPUTask {
    id: string;
    name: string;
    type: "opc" | "simulation" | "training" | "inference";
    memoryRequired: number;
    priority: number;
    estimatedDuration: number;
    status: TaskStatus;
    deviceId?: string;
    startedAt?: number;
    completedAt?: number;
    result?: Record<string, unknown>;
    error?: string;
}
export interface SchedulerConfig {
    maxConcurrentTasks: number;
    preemptionEnabled: boolean;
    memoryThreshold: number;
    schedulingAlgorithm: "fifo" | "priority" | "fair";
}
//# sourceMappingURL=types.d.ts.map
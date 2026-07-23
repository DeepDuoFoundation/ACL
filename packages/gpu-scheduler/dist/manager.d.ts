import type { GPUDevice } from "./types.js";
export declare class GPUManager {
    private devices;
    constructor();
    private registerMockDevices;
    getDevice(id: string): GPUDevice | undefined;
    getAllDevices(): GPUDevice[];
    getAvailableDevices(): GPUDevice[];
    getBestDevice(memoryRequired: number): GPUDevice | null;
    allocateMemory(deviceId: string, amount: number): boolean;
    freeMemory(deviceId: string, amount: number): void;
    updateTemperature(deviceId: string, temp: number): void;
}
//# sourceMappingURL=manager.d.ts.map
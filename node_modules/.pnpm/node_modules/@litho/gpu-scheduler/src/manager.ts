import type { GPUDevice } from "./types.js";

export class GPUManager {
  private devices = new Map<string, GPUDevice>();

  constructor() {
    this.registerMockDevices();
  }

  private registerMockDevices(): void {
    this.devices.set("gpu-0", {
      id: "gpu-0",
      name: "AMD MI250X",
      vendor: "AMD",
      memoryTotal: 128 * 1024 * 1024 * 1024,
      memoryUsed: 0,
      memoryFree: 128 * 1024 * 1024 * 1024,
      utilization: 0,
      temperature: 35,
      status: "available",
    });
    this.devices.set("gpu-1", {
      id: "gpu-1",
      name: "AMD MI250X",
      vendor: "AMD",
      memoryTotal: 128 * 1024 * 1024 * 1024,
      memoryUsed: 0,
      memoryFree: 128 * 1024 * 1024 * 1024,
      utilization: 0,
      temperature: 36,
      status: "available",
    });
  }

  getDevice(id: string): GPUDevice | undefined {
    return this.devices.get(id);
  }

  getAllDevices(): GPUDevice[] {
    return Array.from(this.devices.values());
  }

  getAvailableDevices(): GPUDevice[] {
    return this.getAllDevices().filter((d) => d.status === "available");
  }

  getBestDevice(memoryRequired: number): GPUDevice | null {
    const available = this.getAvailableDevices();
    const suitable = available.filter((d) => d.memoryFree >= memoryRequired);
    if (suitable.length === 0) return null;
    return suitable.sort((a, b) => b.memoryFree - a.memoryFree)[0];
  }

  allocateMemory(deviceId: string, amount: number): boolean {
    const device = this.devices.get(deviceId);
    if (!device || device.memoryFree < amount) return false;
    device.memoryUsed += amount;
    device.memoryFree -= amount;
    device.utilization = device.memoryUsed / device.memoryTotal;
    return true;
  }

  freeMemory(deviceId: string, amount: number): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.memoryUsed = Math.max(0, device.memoryUsed - amount);
      device.memoryFree = device.memoryTotal - device.memoryUsed;
      device.utilization = device.memoryUsed / device.memoryTotal;
    }
  }

  updateTemperature(deviceId: string, temp: number): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.temperature = temp;
    }
  }
}

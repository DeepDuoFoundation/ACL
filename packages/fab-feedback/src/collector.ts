import type { MetrologyReading } from "./types.js";

export class MetrologyCollector {
  private readings = new Map<string, MetrologyReading[]>();

  addReading(reading: MetrologyReading): void {
    const key = `${reading.toolId}:${reading.layer}`;
    if (!this.readings.has(key)) this.readings.set(key, []);
    this.readings.get(key)!.push(reading);
  }

  getReadings(toolId: string, layer: string): MetrologyReading[] {
    return this.readings.get(`${toolId}:${layer}`) ?? [];
  }

  getRecentReadings(toolId: string, layer: string, count: number): MetrologyReading[] {
    const readings = this.getReadings(toolId, layer);
    return readings.slice(-count);
  }

  getReadingsSince(toolId: string, layer: string, since: number): MetrologyReading[] {
    return this.getReadings(toolId, layer).filter((r) => r.timestamp >= since);
  }

  getAverageCD(toolId: string, layer: string): number {
    const readings = this.getReadings(toolId, layer);
    if (readings.length === 0) return 0;
    return readings.reduce((sum, r) => sum + r.cdMean, 0) / readings.length;
  }

  getReadingCount(toolId: string, layer: string): number {
    return this.getReadings(toolId, layer).length;
  }
}
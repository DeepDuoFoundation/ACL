import type { MetrologyReading } from "./types.js";
export declare class MetrologyCollector {
    private readings;
    addReading(reading: MetrologyReading): void;
    getReadings(toolId: string, layer: string): MetrologyReading[];
    getRecentReadings(toolId: string, layer: string, count: number): MetrologyReading[];
    getReadingsSince(toolId: string, layer: string, since: number): MetrologyReading[];
    getAverageCD(toolId: string, layer: string): number;
    getReadingCount(toolId: string, layer: string): number;
}

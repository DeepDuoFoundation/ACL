export class MetrologyCollector {
    readings = new Map();
    addReading(reading) {
        const key = `${reading.toolId}:${reading.layer}`;
        if (!this.readings.has(key))
            this.readings.set(key, []);
        this.readings.get(key).push(reading);
    }
    getReadings(toolId, layer) {
        return this.readings.get(`${toolId}:${layer}`) ?? [];
    }
    getRecentReadings(toolId, layer, count) {
        const readings = this.getReadings(toolId, layer);
        return readings.slice(-count);
    }
    getReadingsSince(toolId, layer, since) {
        return this.getReadings(toolId, layer).filter((r) => r.timestamp >= since);
    }
    getAverageCD(toolId, layer) {
        const readings = this.getReadings(toolId, layer);
        if (readings.length === 0)
            return 0;
        return readings.reduce((sum, r) => sum + r.cdMean, 0) / readings.length;
    }
    getReadingCount(toolId, layer) {
        return this.getReadings(toolId, layer).length;
    }
}

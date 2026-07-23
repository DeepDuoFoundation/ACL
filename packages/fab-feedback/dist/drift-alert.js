const DEFAULT_CONFIG = {
    driftThresholdWarning: 2.0,
    driftThresholdCritical: 5.0,
    calibrationWindow: 24 * 60 * 60 * 1000,
    minReadingsForCalibration: 10,
};
export class DriftDetector {
    config;
    alerts = [];
    baselines = new Map();
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    setBaseline(toolId, layer, cdMean) {
        this.baselines.set(`${toolId}:${layer}`, cdMean);
    }
    getBaseline(toolId, layer) {
        return this.baselines.get(`${toolId}:${layer}`);
    }
    detectDrift(reading) {
        const key = `${reading.toolId}:${reading.layer}`;
        const baseline = this.baselines.get(key);
        if (baseline === undefined)
            return null;
        const deviation = Math.abs(reading.cdMean - baseline);
        const deviationPercent = (deviation / baseline) * 100;
        let severity = "info";
        if (deviationPercent >= this.config.driftThresholdCritical)
            severity = "critical";
        else if (deviationPercent >= this.config.driftThresholdWarning)
            severity = "warning";
        if (severity === "info")
            return null;
        const alert = {
            id: `drift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            toolId: reading.toolId,
            parameter: "cd_mean",
            currentValue: reading.cdMean,
            baselineValue: baseline,
            deviation: deviationPercent,
            severity,
            timestamp: Date.now(),
        };
        this.alerts.push(alert);
        return alert;
    }
    getAlerts(severity) {
        if (severity)
            return this.alerts.filter((a) => a.severity === severity);
        return [...this.alerts];
    }
    clearAlerts() {
        this.alerts = [];
    }
}

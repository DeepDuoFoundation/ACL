export class DriftDetector {
    config;
    baseline = null;
    alerts = [];
    constructor(config) {
        this.config = config;
    }
    async setBaseline(data) {
        this.baseline = data;
    }
    async detectDrift(current) {
        if (!this.baseline)
            return [];
        const newAlerts = [];
        const parameters = [
            { name: "resistThickness", threshold: 2.0 },
            { name: "focusOffset", threshold: 0.5 },
            { name: "doseOffset", threshold: 1.0 },
            { name: "overlayError", threshold: 0.1 },
            { name: "cdUniformity", threshold: 0.05 },
        ];
        for (const param of parameters) {
            const baselineVal = this.baseline[param.name];
            const currentVal = current[param.name];
            if (typeof baselineVal !== "number" || typeof currentVal !== "number")
                continue;
            const drift = Math.abs(currentVal - baselineVal);
            const driftMagnitude = drift / (Math.abs(baselineVal) || 1);
            if (driftMagnitude > this.config.driftThreshold) {
                const alert = {
                    id: `drift-${Date.now()}-${param.name}`,
                    timestamp: Date.now(),
                    parameter: param.name,
                    expectedValue: baselineVal,
                    actualValue: currentVal,
                    driftMagnitude,
                    severity: this.computeSeverity(driftMagnitude),
                    scannerId: current.scannerId,
                };
                newAlerts.push(alert);
                this.alerts.push(alert);
            }
        }
        return newAlerts;
    }
    computeSeverity(driftMagnitude) {
        if (driftMagnitude > 0.1)
            return "critical";
        if (driftMagnitude > 0.05)
            return "high";
        if (driftMagnitude > 0.02)
            return "medium";
        return "low";
    }
    async getAlerts() {
        return [...this.alerts];
    }
    async getAlertsBySeverity(severity) {
        return this.alerts.filter((a) => a.severity === severity);
    }
    async clearAlerts() {
        this.alerts = [];
    }
}
//# sourceMappingURL=drift.js.map
import { CalibrationEngine } from "./calibration.js";
import { DriftDetector } from "./drift.js";
export class DigitalTwinV2 {
    config;
    calibrationEngine;
    driftDetector;
    constructor(config) {
        this.config = config;
        this.calibrationEngine = new CalibrationEngine(config);
        this.driftDetector = new DriftDetector(config);
    }
    async calibrate(data) {
        const calibration = await this.calibrationEngine.calibrate(data);
        const driftAlerts = await this.driftDetector.detectDrift(data);
        const alerts = await this.driftDetector.getAlerts();
        if (alerts.length === 0) {
            await this.driftDetector.setBaseline(data);
        }
        return { calibration, driftAlerts };
    }
    async simulate(mask, layer) {
        const calibration = await this.calibrationEngine.getCalibration();
        const aerialImage = this.computeAerialImage(mask, calibration);
        const resistProfile = this.computeResistProfile(aerialImage, calibration);
        const epe = this.computeEPE(resistProfile);
        const cd = this.computeCD(resistProfile);
        const processWindow = this.computeProcessWindow(calibration);
        return { aerialImage, resistProfile, epe, cd, processWindow };
    }
    computeAerialImage(mask, calibration) {
        const size = mask.length;
        const focusOffset = calibration?.focusOffset ?? 0;
        return mask.map((row, i) => row.map((val, j) => {
            const x = i / size;
            const y = j / size;
            return Math.exp(-((x - 0.5) ** 2 + (y - 0.5) ** 2) * 2) * (1 + focusOffset * 0.01);
        }));
    }
    computeResistProfile(aerialImage, calibration) {
        const doseOffset = calibration?.doseOffset ?? 0;
        const threshold = 0.3 + doseOffset * 0.01;
        return aerialImage.map((row) => row.map((v) => (v > threshold ? 1.0 : 0.0)));
    }
    computeEPE(resistProfile) {
        let epe = 0;
        let count = 0;
        for (let i = 1; i < resistProfile.length - 1; i++) {
            for (let j = 1; j < resistProfile[i].length - 1; j++) {
                const center = resistProfile[i][j];
                const neighbors = [
                    resistProfile[i - 1][j],
                    resistProfile[i + 1][j],
                    resistProfile[i][j - 1],
                    resistProfile[i][j + 1],
                ];
                if (center !== neighbors[0] || center !== neighbors[1]) {
                    epe += Math.abs(center - 0.5);
                    count++;
                }
            }
        }
        return count > 0 ? epe / count : 0;
    }
    computeCD(resistProfile) {
        let cd = 0;
        for (const row of resistProfile) {
            for (const v of row) {
                if (v > 0.5)
                    cd++;
            }
        }
        return cd / resistProfile.length;
    }
    computeProcessWindow(calibration) {
        if (!calibration)
            return 1.0;
        const focusRange = Math.abs(calibration.focusOffset) * 0.1;
        const doseRange = Math.abs(calibration.doseOffset) * 0.1;
        return Math.max(0, 1.0 - focusRange - doseRange);
    }
    getCalibrationEngine() {
        return this.calibrationEngine;
    }
    getDriftDetector() {
        return this.driftDetector;
    }
}
//# sourceMappingURL=twin.js.map
const DEFAULT_CONFIG = {
    maxStackHeight: 500,
    thermalThrottleTemp: 105,
    interposerConductivity: 150,
};
export class ThermalSimulator {
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    simulate(stack) {
        return stack.dies.map((die) => {
            const baseTemp = 25;
            const powerDensity = die.tdp / (die.width * die.height);
            const thermalResistance = die.thickness / (this.config.interposerConductivity * die.width * die.height);
            const maxTemp = baseTemp + die.tdp * thermalResistance + powerDensity * 100;
            const hotspotCount = maxTemp > this.config.thermalThrottleTemp ? 3 : maxTemp > 80 ? 1 : 0;
            const hotspotLocations = Array.from({ length: hotspotCount }, () => ({
                x: Math.random() * die.width,
                y: Math.random() * die.height,
                temp: maxTemp + Math.random() * 5,
            }));
            return {
                dieId: die.id,
                maxTemperature: maxTemp,
                hotspotCount,
                hotspotLocations,
                coolingRequired: maxTemp > this.config.thermalThrottleTemp,
            };
        });
    }
    getWorstDie(profiles) {
        return profiles.reduce((worst, p) => (p.maxTemperature > (worst?.maxTemperature ?? 0) ? p : worst), undefined);
    }
    needsThrottling(profiles) {
        return profiles.some((p) => p.maxTemperature > this.config.thermalThrottleTemp);
    }
    getDeratingFactor(temp) {
        if (temp < 70)
            return 1.0;
        if (temp < 100)
            return 1.0 - (temp - 70) * 0.01;
        return 0.7;
    }
}

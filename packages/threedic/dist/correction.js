export class MultiDieCorrector {
    correctDie(dieId, layer, epeMap, thermalDerating) {
        const correctedMap = epeMap.map((row) => row.map((epe) => epe * thermalDerating));
        const maxEpe = Math.max(...correctedMap.flat());
        return {
            dieId,
            layer,
            epeMap: correctedMap,
            correctionApplied: maxEpe < 1.0,
            thermalDerating,
        };
    }
    correctStack(stack, layer, thermalProfiles) {
        const thermalSim = new Map(thermalProfiles.map((p) => [p.dieId, p]));
        return stack.dies.map((die) => {
            const profile = thermalSim.get(die.id);
            const derating = profile ? (profile.coolingRequired ? 0.85 : 1.0) : 1.0;
            const dummyEpe = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0.5 + Math.random() * 0.5));
            return this.correctDie(die.id, layer, dummyEpe, derating);
        });
    }
    getThermalDerating(profile) {
        if (profile.maxTemperature < 70)
            return 1.0;
        if (profile.maxTemperature < 100)
            return 1.0 - (profile.maxTemperature - 70) * 0.01;
        return 0.7;
    }
}

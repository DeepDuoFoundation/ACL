export class EPEHeatmap {
    data = [];
    addData(epeData) {
        this.data.push(epeData);
        if (this.data.length > 100) {
            this.data.shift();
        }
    }
    getLatest() {
        return this.data[this.data.length - 1];
    }
    getByLayer(layer) {
        return this.data.filter((d) => d.layer === layer);
    }
    getHeatmap(layer) {
        const latest = this.data.filter((d) => d.layer === layer).pop();
        return latest?.epeMap ?? [];
    }
    getStatistics(layer) {
        const layerData = this.getByLayer(layer);
        if (layerData.length === 0) {
            return { avgEPE: 0, maxEPE: 0, rmsEPE: 0, violationCount: 0 };
        }
        const latest = layerData[layerData.length - 1];
        return {
            avgEPE: latest.avgEPE,
            maxEPE: latest.maxEPE,
            rmsEPE: latest.rmsEPE,
            violationCount: latest.epeMap.flat().filter((v) => v > 1.0).length,
        };
    }
    clear() {
        this.data = [];
    }
}
//# sourceMappingURL=heatmap.js.map
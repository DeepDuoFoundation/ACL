import type { EPEData } from "./types.js";

export class EPEHeatmap {
  private data: EPEData[] = [];

  addData(epeData: EPEData): void {
    this.data.push(epeData);
    if (this.data.length > 100) {
      this.data.shift();
    }
  }

  getLatest(): EPEData | undefined {
    return this.data[this.data.length - 1];
  }

  getByLayer(layer: string): EPEData[] {
    return this.data.filter((d) => d.layer === layer);
  }

  getHeatmap(layer: string): number[][] {
    const latest = this.data.filter((d) => d.layer === layer).pop();
    return latest?.epeMap ?? [];
  }

  getStatistics(layer: string): {
    avgEPE: number;
    maxEPE: number;
    rmsEPE: number;
    violationCount: number;
  } {
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

  clear(): void {
    this.data = [];
  }
}

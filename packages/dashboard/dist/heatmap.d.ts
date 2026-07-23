import type { EPEData } from "./types.js";
export declare class EPEHeatmap {
    private data;
    addData(epeData: EPEData): void;
    getLatest(): EPEData | undefined;
    getByLayer(layer: string): EPEData[];
    getHeatmap(layer: string): number[][];
    getStatistics(layer: string): {
        avgEPE: number;
        maxEPE: number;
        rmsEPE: number;
        violationCount: number;
    };
    clear(): void;
}
//# sourceMappingURL=heatmap.d.ts.map
import type { EDAConfig, EDATask, EDAResult } from "./types.js";
import { EDAConnector } from "./types.js";
export declare class CalibreConnector extends EDAConnector {
    readonly name = "Calibre";
    readonly vendor = "Siemens EDA";
    private connected;
    constructor(config: EDAConfig);
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    execute(task: EDATask): Promise<EDAResult>;
    getStatus(): Promise<{
        connected: boolean;
        licenseValid: boolean;
    }>;
}
//# sourceMappingURL=calibre.d.ts.map
import type { EDAConfig, EDATask, EDAResult } from "./types.js";
import { EDAConnector } from "./types.js";
export declare class ProteusConnector extends EDAConnector {
    readonly name = "Proteus";
    readonly vendor = "Synopsys";
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
//# sourceMappingURL=proteus.d.ts.map
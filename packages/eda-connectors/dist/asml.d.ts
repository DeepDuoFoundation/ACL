import type { EDAConfig, EDATask, EDAResult } from "./types.js";
import { EDAConnector } from "./types.js";
export declare class ASMLConnector extends EDAConnector {
    readonly name = "ASML PAS";
    readonly vendor = "ASML";
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
//# sourceMappingURL=asml.d.ts.map
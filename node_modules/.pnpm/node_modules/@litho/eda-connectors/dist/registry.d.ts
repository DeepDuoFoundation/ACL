import type { EDATask, EDAResult } from "./types.js";
import { EDAConnector } from "./types.js";
export declare class EDAConnectorRegistry {
    private connectors;
    register(connector: EDAConnector): void;
    get(name: string): EDAConnector | undefined;
    list(): string[];
    connectAll(): Promise<void>;
    disconnectAll(): Promise<void>;
    executeWithBestConnector(task: EDATask): Promise<EDAResult>;
}
//# sourceMappingURL=registry.d.ts.map
import type { PDKConfig, ProcessLayer, OPCRule, DesignRule } from "./types.js";
export declare class PDKManager {
    private pdkConfigs;
    private loadedPDK;
    constructor();
    registerPDK(config: PDKConfig): void;
    loadPDK(name: string): PDKConfig;
    getLoadedPDK(): PDKConfig;
    listAvailable(): string[];
    getLayer(name: string): ProcessLayer;
    getOPCRule(layer: string): OPCRule;
    getDesignRules(): DesignRule[];
    validateDesignRule(ruleName: string, value: number, layer?: string): boolean;
}
//# sourceMappingURL=manager.d.ts.map
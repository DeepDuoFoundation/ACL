import { TSMCN3E } from "./tsmc-n3e.js";
import { SamsungSF3 } from "./samsung-sf3.js";
import { Intel18A } from "./intel-18a.js";
import { GF22FDX } from "./gf-22fdx.js";
import { UMC22nm } from "./umc-22nm.js";
export class PDKManager {
    pdkConfigs = new Map();
    loadedPDK = null;
    constructor() {
        this.registerPDK(TSMCN3E);
        this.registerPDK(SamsungSF3);
        this.registerPDK(Intel18A);
        this.registerPDK(GF22FDX);
        this.registerPDK(UMC22nm);
    }
    registerPDK(config) {
        this.pdkConfigs.set(config.name, config);
    }
    loadPDK(name) {
        const config = this.pdkConfigs.get(name);
        if (!config) {
            throw new Error(`PDK not found: ${name}. Available: ${Array.from(this.pdkConfigs.keys()).join(", ")}`);
        }
        this.loadedPDK = config;
        return config;
    }
    getLoadedPDK() {
        if (!this.loadedPDK) {
            throw new Error("No PDK loaded. Call loadPDK() first.");
        }
        return this.loadedPDK;
    }
    listAvailable() {
        return Array.from(this.pdkConfigs.keys());
    }
    getLayer(name) {
        const pdk = this.getLoadedPDK();
        const layer = pdk.layers.find((l) => l.name === name);
        if (!layer) {
            throw new Error(`Layer not found: ${name} in PDK ${pdk.name}`);
        }
        return layer;
    }
    getOPCRule(layer) {
        const pdk = this.getLoadedPDK();
        const rule = pdk.opcRules.find((r) => r.layer === layer);
        if (!rule) {
            throw new Error(`OPC rule not found for layer: ${layer} in PDK ${pdk.name}`);
        }
        return rule;
    }
    getDesignRules() {
        return this.getLoadedPDK().designRules;
    }
    validateDesignRule(ruleName, value, layer) {
        const rules = this.getDesignRules();
        const rule = rules.find((r) => r.name === ruleName && (!layer || r.layer === layer));
        if (!rule)
            return true;
        if (value < rule.min)
            return false;
        if (rule.max !== undefined && value > rule.max)
            return false;
        return true;
    }
}
//# sourceMappingURL=manager.js.map
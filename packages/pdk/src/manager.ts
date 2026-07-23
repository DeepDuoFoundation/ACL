import type { PDKConfig, ProcessLayer, OPCRule, DesignRule } from "./types.js";
import { TSMCN3E } from "./tsmc-n3e.js";
import { SamsungSF3 } from "./samsung-sf3.js";
import { Intel18A } from "./intel-18a.js";
import { GF22FDX } from "./gf-22fdx.js";
import { UMC22nm } from "./umc-22nm.js";

export class PDKManager {
  private pdkConfigs = new Map<string, PDKConfig>();
  private loadedPDK: PDKConfig | null = null;

  constructor() {
    this.registerPDK(TSMCN3E);
    this.registerPDK(SamsungSF3);
    this.registerPDK(Intel18A);
    this.registerPDK(GF22FDX);
    this.registerPDK(UMC22nm);
  }

  registerPDK(config: PDKConfig): void {
    this.pdkConfigs.set(config.name, config);
  }

  loadPDK(name: string): PDKConfig {
    let config = this.pdkConfigs.get(name);

    if (!config) {
      // Try normalized slug lookup
      const targetSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const [key, val] of this.pdkConfigs.entries()) {
        const keySlug = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (keySlug === targetSlug) {
          config = val;
          break;
        }
      }
    }

    if (!config) {
      throw new Error(`PDK not found: ${name}. Available: ${Array.from(this.pdkConfigs.keys()).join(", ")}`);
    }
    this.loadedPDK = config;
    return config;
  }

  getLoadedPDK(): PDKConfig {
    if (!this.loadedPDK) {
      throw new Error("No PDK loaded. Call loadPDK() first.");
    }
    return this.loadedPDK;
  }

  listAvailable(): string[] {
    return Array.from(this.pdkConfigs.keys());
  }

  getLayer(name: string): ProcessLayer {
    const pdk = this.getLoadedPDK();
    const layer = pdk.layers.find((l) => l.name === name);
    if (!layer) {
      throw new Error(`Layer not found: ${name} in PDK ${pdk.name}`);
    }
    return layer;
  }

  getOPCRule(layer: string): OPCRule {
    const pdk = this.getLoadedPDK();
    const rule = pdk.opcRules.find((r) => r.layer === layer);
    if (!rule) {
      throw new Error(`OPC rule not found for layer: ${layer} in PDK ${pdk.name}`);
    }
    return rule;
  }

  getDesignRules(): DesignRule[] {
    return this.getLoadedPDK().designRules;
  }

  validateDesignRule(ruleName: string, value: number, layer?: string): boolean {
    const rules = this.getDesignRules();
    const rule = rules.find((r) => r.name === ruleName && (!layer || r.layer === layer));
    if (!rule) return true;

    if (value < rule.min) return false;
    if (rule.max !== undefined && value > rule.max) return false;
    return true;
  }
}

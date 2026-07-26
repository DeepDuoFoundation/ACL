/**
 * Multi-Foundry PDK Abstraction — PRD §6.12
 * Normalizes DRC rules, layer stacks, resist parameters, scanner models across foundries
 */

export type Foundry = 'tsmc' | 'samsung' | 'intel' | 'gf' | 'umc';

export interface PdkConfig {
  foundry: Foundry;
  node: string;
  layers: PdkLayer[];
  drcRules: DrcRule[];
  resistParams: ResistParams;
  scannerModel: string;
}

export interface PdkLayer {
  name: string;
  number: number;
  type: 'metal' | 'via' | 'oxide' | 'poly' | 'implant';
  minWidth: number;
  minSpacing: number;
  thickness: number;
}

export interface DrcRule {
  id: string;
  description: string;
  check: string;
  threshold: number;
  severity: 'error' | 'warning';
}

export interface ResistParams {
  type: string;
  thickness: number;
  sensitivity: number;
  contrast: number;
  pebTemperature: number;
  developTime: number;
}

export class PdkAbstraction {
  private pdks: Map<string, PdkConfig> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.pdks.set('tsmc-n3e', {
      foundry: 'tsmc', node: 'N3E',
      layers: [
        { name: 'M1', number: 1, type: 'metal', minWidth: 12, minSpacing: 12, thickness: 30 },
        { name: 'M2', number: 2, type: 'metal', minWidth: 14, minSpacing: 14, thickness: 32 },
        { name: 'V1', number: 10, type: 'via', minWidth: 10, minSpacing: 14, thickness: 20 },
      ],
      drcRules: [
        { id: 'DRC-M1-001', description: 'M1 minimum width', check: 'width(M1) >= 12nm', threshold: 12, severity: 'error' },
        { id: 'DRC-M1-002', description: 'M1 minimum spacing', check: 'space(M1) >= 12nm', threshold: 12, severity: 'error' },
      ],
      resistParams: { type: 'EUV-MetalOxide', thickness: 30, sensitivity: 30, contrast: 8, pebTemperature: 90, developTime: 45 },
      scannerModel: 'ASML NXE:3600D',
    });
    this.pdks.set('samsung-sf3', {
      foundry: 'samsung', node: 'SF3',
      layers: [
        { name: 'M1', number: 1, type: 'metal', minWidth: 10, minSpacing: 10, thickness: 28 },
        { name: 'M2', number: 2, type: 'metal', minWidth: 12, minSpacing: 12, thickness: 30 },
      ],
      drcRules: [
        { id: 'SF-M1-001', description: 'M1 minimum width', check: 'width(M1) >= 10nm', threshold: 10, severity: 'error' },
      ],
      resistParams: { type: 'EUV-CAR', thickness: 35, sensitivity: 25, contrast: 6, pebTemperature: 110, developTime: 60 },
      scannerModel: 'ASML NXE:3800E',
    });
    this.pdks.set('intel-18a', {
      foundry: 'intel', node: '18A',
      layers: [
        { name: 'M0', number: 0, type: 'metal', minWidth: 14, minSpacing: 14, thickness: 32 },
        { name: 'M1', number: 1, type: 'metal', minWidth: 16, minSpacing: 16, thickness: 34 },
      ],
      drcRules: [],
      resistParams: { type: 'EUV-MetalOxide', thickness: 28, sensitivity: 35, contrast: 9, pebTemperature: 85, developTime: 40 },
      scannerModel: 'ASML EXE:5000',
    });
  }

  async getPdk(foundry: Foundry, node: string): Promise<PdkConfig | undefined> {
    const key = `${foundry}-${node}`.toLowerCase();
    return this.pdks.get(key);
  }

  async listPdks(): Promise<string[]> {
    return Array.from(this.pdks.keys());
  }

  async portRecipe(sourcePdk: string, targetPdk: string): Promise<{ mappings: Record<string, string>; warnings: string[] }> {
    const src = this.pdks.get(sourcePdk);
    const tgt = this.pdks.get(targetPdk);
    if (!src || !tgt) throw new Error('PDK not found');

    const warnings: string[] = [];
    const mappings: Record<string, string> = {};

    for (const srcLayer of src.layers) {
      const tgtLayer = tgt.layers.find(l => l.type === srcLayer.type);
      if (tgtLayer) {
        mappings[srcLayer.name] = tgtLayer.name;
        if (tgtLayer.minWidth > srcLayer.minWidth * 1.1) {
          warnings.push(`${srcLayer.name}: target min width ${tgtLayer.minWidth}nm is >110% of source ${srcLayer.minWidth}nm`);
        }
      } else {
        warnings.push(`No ${srcLayer.type} layer in target PDK ${targetPdk}`);
      }
    }
    return { mappings, warnings };
  }
}
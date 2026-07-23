import type { MaskPattern, OPCResult, PipelineConfig } from "./types.js";

export class RuleBasedOPC {
  private config: PipelineConfig;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  async correct(mask: MaskPattern): Promise<OPCResult> {
    const startTime = Date.now();
    let corrected = this.applyRuleBasedCorrections(mask);
    let converged = false;

    for (let i = 0; i < this.config.maxIterations; i++) {
      const simulated = this.simulateAerialImage(corrected);
      const epe = this.computeEPE(simulated);

      if (Math.max(...epe) < this.config.convergenceThreshold) {
        converged = true;
        break;
      }

      corrected = this.adjustMask(corrected, epe);
    }

    return {
      correctedMask: corrected,
      correctionTime: Date.now() - startTime,
      iterationCount: this.config.maxIterations,
      convergence: converged,
    };
  }

  private applyRuleBasedCorrections(mask: MaskPattern): MaskPattern {
    return {
      ...mask,
      polygons: mask.polygons.map((p) => ({
        ...p,
        x: p.x + (p.width > mask.pitch * 0.5 ? 2 : 1),
        y: p.y + (p.height > mask.pitch * 0.5 ? 2 : 1),
        width: p.width * (1 - 0.02),
        height: p.height * (1 - 0.02),
      })),
    };
  }

  private simulateAerialImage(mask: MaskPattern): number[][] {
    const size = 64;
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => {
        const x = i / size;
        const y = j / size;
        return Math.exp(-((x - 0.5) ** 2 + (y - 0.5) ** 2) * 2);
      })
    );
  }

  private computeEPE(aerialImage: number[][]): number[] {
    return aerialImage.flat().map((v) => Math.abs(v - 0.5) * 10);
  }

  private adjustMask(mask: MaskPattern, epe: number[]): MaskPattern {
    return {
      ...mask,
      polygons: mask.polygons.map((p, i) => ({
        ...p,
        x: p.x + (epe[i] > 0 ? 0.5 : -0.5),
        y: p.y + (epe[i] > 0 ? 0.5 : -0.5),
      })),
    };
  }
}

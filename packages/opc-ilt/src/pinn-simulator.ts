import type { MaskPattern, SimulationResult } from "./types.js";

export class PINNSimulator {
  private modelLoaded = false;

  async loadModel(): Promise<void> {
    this.modelLoaded = true;
  }

  async simulate(mask: MaskPattern): Promise<SimulationResult> {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    const aerialImage = this.pinnForward(mask);
    const resistImage = this.threshold(aerialImage);
    const epe = this.extractEPE(resistImage);
    const cd = this.extractCD(resistImage);

    return { aerialImage, resistImage, epe, cd };
  }

  private pinnForward(mask: MaskPattern): number[][] {
    const size = 64;
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => {
        let sum = 0;
        for (const poly of mask.polygons) {
          const dx = (i - poly.x * size / 1000) / size;
          const dy = (j - poly.y * size / 1000) / size;
          sum += Math.exp(-(dx * dx + dy * dy) * 8) * (1 + Math.random() * 0.01);
        }
        return Math.min(sum, 1.0);
      })
    );
  }

  private threshold(image: number[][]): number[][] {
    const t = 0.35;
    return image.map((row) => row.map((v) => (v > t ? 1.0 : 0.0)));
  }

  private extractEPE(resist: number[][]): number[] {
    const epe: number[] = [];
    for (let i = 1; i < resist.length - 1; i++) {
      if (resist[i][i] !== resist[i][i - 1]) {
        epe.push(Math.abs(resist[i][i] - 0.5) * 2);
      }
    }
    return epe;
  }

  private extractCD(resist: number[][]): number[] {
    return resist.map((row) => {
      let cd = 0;
      for (const v of row) {
        if (v > 0.5) cd++;
      }
      return cd * 0.5;
    });
  }
}

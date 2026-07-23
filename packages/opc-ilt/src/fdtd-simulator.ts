import type { MaskPattern, SimulationResult } from "./types.js";

export class FDTDSimulator {
  private useGPU: boolean;

  constructor(useGPU = true) {
    this.useGPU = useGPU;
  }

  async simulate(mask: MaskPattern): Promise<SimulationResult> {
    const aerialImage = this.computeAerialImage(mask);
    const resistImage = this.computeResistImage(aerialImage);
    const epe = this.extractEPE(resistImage);
    const cd = this.extractCD(resistImage);

    return { aerialImage, resistImage, epe, cd };
  }

  private computeAerialImage(mask: MaskPattern): number[][] {
    const size = 128;
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => {
        let intensity = 0;
        for (const poly of mask.polygons) {
          const dx = (i - poly.x * size / 1000) / size;
          const dy = (j - poly.y * size / 1000) / size;
          intensity += Math.exp(-(dx * dx + dy * dy) * 10);
        }
        return Math.min(intensity, 1.0);
      })
    );
  }

  private computeResistImage(aerialImage: number[][]): number[][] {
    const threshold = 0.3;
    return aerialImage.map((row) => row.map((v) => (v > threshold ? 1.0 : 0.0)));
  }

  private extractEPE(resistImage: number[][]): number[] {
    const epe: number[] = [];
    for (let i = 1; i < resistImage.length - 1; i++) {
      const left = resistImage[i][i - 1];
      const center = resistImage[i][i];
      const right = resistImage[i][i + 1];
      if (center !== left || center !== right) {
        epe.push(Math.abs(center - 0.5) * 2);
      }
    }
    return epe;
  }

  private extractCD(resistImage: number[][]): number[] {
    return resistImage.map((row) => {
      let cd = 0;
      for (const v of row) {
        if (v > 0.5) cd++;
      }
      return cd * 0.5;
    });
  }
}

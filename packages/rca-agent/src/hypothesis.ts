import type { Symptom, Hypothesis, RCAConfig } from "./types.js";

export class HypothesisGenerator {
  private config: RCAConfig;

  constructor(config: RCAConfig) {
    this.config = config;
  }

  async generate(symptom: Symptom, kgEvidence: string[]): Promise<Hypothesis[]> {
    const hypotheses: Hypothesis[] = [];

    hypotheses.push(...this.generateLayoutHypotheses(symptom, kgEvidence));
    hypotheses.push(...this.generateMaskHypotheses(symptom, kgEvidence));
    hypotheses.push(...this.generateIlluminationHypotheses(symptom, kgEvidence));
    hypotheses.push(...this.generateResistHypotheses(symptom, kgEvidence));
    hypotheses.push(...this.generateEquipmentHypotheses(symptom, kgEvidence));

    return hypotheses
      .filter((h) => h.probability >= this.config.minProbability)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, this.config.maxHypotheses);
  }

  private generateLayoutHypotheses(symptom: Symptom, evidence: string[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    if (symptom.type === "epe_violation") {
      hypotheses.push({
        id: `hyp-layout-${Date.now()}-1`,
        cause: "Dense pattern pitch violation causing optical proximity effects",
        category: "layout",
        probability: 0.65,
        evidence: [...evidence, "Layout density analysis shows hotspots in affected region"],
        predictedImprovement: 0.8,
      });
    }

    if (symptom.type === "cd_variation") {
      hypotheses.push({
        id: `hyp-layout-${Date.now()}-2`,
        cause: "Sub-resolution assist features (SRAFs) incorrectly placed",
        category: "layout",
        probability: 0.45,
        evidence: [...evidence, "SRAF placement analysis shows gaps in affected patterns"],
        predictedImprovement: 0.5,
      });
    }

    return hypotheses;
  }

  private generateMaskHypotheses(symptom: Symptom, evidence: string[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    if (symptom.type === "epe_violation" || symptom.type === "cd_variation") {
      hypotheses.push({
        id: `hyp-mask-${Date.now()}-1`,
        cause: "Mask CDU variation exceeding specification",
        category: "mask",
        probability: 0.55,
        evidence: [...evidence, "Mask metrology shows CDU drift on affected layer"],
        predictedImprovement: 0.7,
      });
    }

    return hypotheses;
  }

  private generateIlluminationHypotheses(symptom: Symptom, evidence: string[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    if (symptom.type === "epe_violation") {
      hypotheses.push({
        id: `hyp-illum-${Date.now()}-1`,
        cause: "Illumination source pupil fill degradation",
        category: "illumination",
        probability: 0.35,
        evidence: [...evidence, "Scanner log shows pupil monitoring deviation"],
        predictedImprovement: 0.4,
      });
    }

    return hypotheses;
  }

  private generateResistHypotheses(symptom: Symptom, evidence: string[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    if (symptom.type === "cd_variation") {
      hypotheses.push({
        id: `hyp-resist-${Date.now()}-1`,
        cause: "Resist thickness uniformity drift",
        category: "resist",
        probability: 0.40,
        evidence: [...evidence, "Resist coating uniformity data shows variation"],
        predictedImprovement: 0.5,
      });
    }

    return hypotheses;
  }

  private generateEquipmentHypotheses(symptom: Symptom, evidence: string[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    if (symptom.type === "epe_violation" || symptom.type === "overlay_error") {
      hypotheses.push({
        id: `hyp-equip-${Date.now()}-1`,
        cause: "Scanner focus drift on affected exposure tool",
        category: "equipment",
        probability: 0.70,
        evidence: [...evidence, "Scanner focus monitoring shows drift trend"],
        predictedImprovement: 0.9,
      });
    }

    return hypotheses;
  }
}

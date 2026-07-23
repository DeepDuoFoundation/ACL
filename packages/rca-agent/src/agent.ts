import type { Symptom, Hypothesis, CausalChain, FixRecommendation, RCAResult, RCAConfig } from "./types.js";
import { CausalGraph } from "./causal-graph.js";
import { HypothesisGenerator } from "./hypothesis.js";

export class RCAAgent {
  private config: RCAConfig;
  private causalGraph: CausalGraph;
  private hypothesisGenerator: HypothesisGenerator;

  constructor(config: RCAConfig) {
    this.config = config;
    this.causalGraph = new CausalGraph();
    this.hypothesisGenerator = new HypothesisGenerator(config);
  }

  async investigate(symptom: Symptom): Promise<RCAResult> {
    const startTime = Date.now();

    const kgNodes = this.causalGraph.findRelatedNodes(symptom);
    const kgEvidence = kgNodes.map((n) => n.id);

    const hypotheses = await this.hypothesisGenerator.generate(symptom, kgEvidence);

    const validatedHypothesis = this.config.enableDigitalTwinValidation
      ? await this.validateWithDigitalTwin(hypotheses)
      : hypotheses[0];

    const fixRecommendations = this.generateFixRecommendations(validatedHypothesis, symptom);

    const causalChain: CausalChain = {
      symptom,
      hypotheses,
      validatedHypothesis,
      digitalTwinValidation: this.config.enableDigitalTwinValidation,
      fixRecommendations,
    };

    return {
      id: `rca-${Date.now()}`,
      symptom,
      causalChain,
      turnaroundTime: Date.now() - startTime,
      accuracy: validatedHypothesis?.probability ?? 0,
      kgNodesReferenced: kgEvidence,
    };
  }

  private async validateWithDigitalTwin(hypotheses: Hypothesis[]): Promise<Hypothesis | undefined> {
    for (const hyp of hypotheses) {
      const validated = this.simulateDigitalTwinValidation(hyp);
      if (validated) return hyp;
    }
    return hypotheses[0];
  }

  private simulateDigitalTwinValidation(hypothesis: Hypothesis): boolean {
    return hypothesis.probability > 0.5;
  }

  private generateFixRecommendations(hypothesis: Hypothesis | undefined, symptom: Symptom): FixRecommendation[] {
    if (!hypothesis) return [];

    const recommendations: FixRecommendation[] = [];

    switch (hypothesis.category) {
      case "layout":
        recommendations.push({
          id: `fix-${Date.now()}-1`,
          action: "Adjust SRAF placement for affected patterns",
          target: symptom.layer,
          predictedEPEImprovement: 0.6,
          confidence: 0.8,
          riskLevel: "low",
        });
        break;
      case "mask":
        recommendations.push({
          id: `fix-${Date.now()}-2`,
          action: "Re-write mask for affected layer with updated OPC",
          target: symptom.layer,
          predictedEPEImprovement: 0.7,
          confidence: 0.75,
          riskLevel: "medium",
        });
        break;
      case "equipment":
        recommendations.push({
          id: `fix-${Date.now()}-3`,
          action: "Recalibrate scanner focus on affected tool",
          target: "scanner",
          predictedEPEImprovement: 0.9,
          confidence: 0.85,
          riskLevel: "low",
        });
        break;
      default:
        recommendations.push({
          id: `fix-${Date.now()}-4`,
          action: "Review and adjust process parameters",
          target: symptom.layer,
          predictedEPEImprovement: 0.5,
          confidence: 0.7,
          riskLevel: "medium",
        });
    }

    return recommendations;
  }

  getCausalGraph(): CausalGraph {
    return this.causalGraph;
  }
}

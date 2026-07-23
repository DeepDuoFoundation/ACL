import type { Symptom, RCAResult, RCAConfig } from "./types.js";
import { CausalGraph } from "./causal-graph.js";
export declare class RCAAgent {
    private config;
    private causalGraph;
    private hypothesisGenerator;
    constructor(config: RCAConfig);
    investigate(symptom: Symptom): Promise<RCAResult>;
    private validateWithDigitalTwin;
    private simulateDigitalTwinValidation;
    private generateFixRecommendations;
    getCausalGraph(): CausalGraph;
}
//# sourceMappingURL=agent.d.ts.map
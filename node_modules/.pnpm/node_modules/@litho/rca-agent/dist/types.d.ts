export type SymptomType = "epe_violation" | "yield_drop" | "defect_cluster" | "cd_variation" | "overlay_error";
export interface Symptom {
    id: string;
    type: SymptomType;
    severity: "low" | "medium" | "high" | "critical";
    layer: string;
    location: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    metrics: Record<string, number>;
    timestamp: number;
    description: string;
}
export interface Hypothesis {
    id: string;
    cause: string;
    category: "layout" | "mask" | "illumination" | "resist" | "equipment";
    probability: number;
    evidence: string[];
    predictedImprovement: number;
}
export interface CausalChain {
    symptom: Symptom;
    hypotheses: Hypothesis[];
    validatedHypothesis?: Hypothesis;
    digitalTwinValidation: boolean;
    fixRecommendations: FixRecommendation[];
}
export interface FixRecommendation {
    id: string;
    action: string;
    target: string;
    predictedEPEImprovement: number;
    confidence: number;
    riskLevel: "low" | "medium" | "high";
}
export interface RCAResult {
    id: string;
    symptom: Symptom;
    causalChain: CausalChain;
    turnaroundTime: number;
    accuracy: number;
    kgNodesReferenced: string[];
}
export interface RCAConfig {
    maxHypotheses: number;
    minProbability: number;
    enableDigitalTwinValidation: boolean;
    kgTraversalDepth: number;
}
//# sourceMappingURL=types.d.ts.map
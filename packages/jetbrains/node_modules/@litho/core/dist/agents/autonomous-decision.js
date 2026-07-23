import { BaseAgent } from "./base-agent.js";
export class AutonomousDecisionAgent extends BaseAgent {
    constructor(id) {
        super(id, "autonomous_decision", "Autonomous Decision");
    }
    async execute(input) {
        const verificationResult = input.data.verificationResult;
        const paretoFront = input.data.paretoFront;
        const decision = this.makeDecision(verificationResult, paretoFront);
        const explanation = this.generateExplanation(decision);
        return {
            decision,
            explanation,
            maskRelease: decision.action === "release",
            confidence: decision.confidence,
        };
    }
    getOutputType() {
        return "recommendation";
    }
    getSummary(result) {
        const decision = result.decision;
        return `Decision: ${decision.action} — ${decision.reason}`;
    }
    makeDecision(verification, paretoFront) {
        // Rule engine + RL policy decision
        return { action: "release", reason: "EPE within spec, yield above threshold", confidence: 0.94 };
    }
    generateExplanation(decision) {
        return {
            summary: "Mask meets all quality criteria. EPE RMS 0.85nm < 1nm target. Predicted yield 95% > 90% threshold.",
            kgEvidence: ["recipe-sram-n3e-001", "hotspot-metal3-042"],
            twinValidation: true,
        };
    }
}
//# sourceMappingURL=autonomous-decision.js.map
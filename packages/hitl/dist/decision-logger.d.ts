import type { HumanDecision } from "./types.js";
export declare class DecisionLogger {
    private decisions;
    log(decision: HumanDecision): Promise<void>;
    getByAgent(agentId: string): Promise<HumanDecision[]>;
    getByStep(stepId: string): Promise<HumanDecision[]>;
    getRecent(count: number): Promise<HumanDecision[]>;
    getStats(): Promise<{
        totalDecisions: number;
        averageConfidence: number;
        byMode: Record<string, number>;
    }>;
    clear(): Promise<void>;
}
//# sourceMappingURL=decision-logger.d.ts.map
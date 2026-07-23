import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class AutonomousDecisionAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "recommendation";
    protected getSummary(result: Record<string, unknown>): string;
    private makeDecision;
    private generateExplanation;
}
//# sourceMappingURL=autonomous-decision.d.ts.map
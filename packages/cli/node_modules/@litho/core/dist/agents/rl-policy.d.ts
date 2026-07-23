import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class RLPolicyAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "recommendation";
    protected getSummary(result: Record<string, unknown>): string;
    private selectAction;
    private computeReward;
    private updatePolicy;
}
//# sourceMappingURL=rl-policy.d.ts.map
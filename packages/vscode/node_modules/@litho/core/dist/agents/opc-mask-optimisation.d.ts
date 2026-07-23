import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class OPCMaskOptimisationAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "correction";
    protected getSummary(result: Record<string, unknown>): string;
    private runOPC;
    private computeEPE;
    private computeMaskComplexity;
}
//# sourceMappingURL=opc-mask-optimisation.d.ts.map
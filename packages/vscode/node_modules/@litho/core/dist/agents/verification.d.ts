import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class VerificationAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "analysis";
    protected getSummary(result: Record<string, unknown>): string;
    private computeEPEMap;
    private computePVBands;
    private scoreDFM;
    private predictYield;
}
//# sourceMappingURL=verification.d.ts.map
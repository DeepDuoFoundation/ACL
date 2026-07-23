import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class PINOInverseAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "correction";
    protected getSummary(result: Record<string, unknown>): string;
    private solveInverse;
    private validatePDEConstraints;
}
//# sourceMappingURL=pino-inverse.d.ts.map
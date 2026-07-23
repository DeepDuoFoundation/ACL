import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class LayoutUnderstandingAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "analysis";
    protected getSummary(result: Record<string, unknown>): string;
    private classifyPatterns;
    private detectHotspots;
    private scoreManufacturability;
}
//# sourceMappingURL=layout-understanding.d.ts.map
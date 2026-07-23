import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class FourierLithographyAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "analysis";
    protected getSummary(result: Record<string, unknown>): string;
    private computeFourierTransform;
    private analyzeResolution;
}
//# sourceMappingURL=fourier-lithography.d.ts.map
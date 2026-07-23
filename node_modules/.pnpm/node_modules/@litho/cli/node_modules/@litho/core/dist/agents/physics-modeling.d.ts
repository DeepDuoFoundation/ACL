import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class PhysicsModelingAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "analysis";
    protected getSummary(result: Record<string, unknown>): string;
    private computeAerialImage;
    private simulateResist;
    private validateFidelity;
}
//# sourceMappingURL=physics-modeling.d.ts.map
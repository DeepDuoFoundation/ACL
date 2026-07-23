import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";
export declare class ConflictResolutionAgent extends BaseAgent {
    constructor(id: string);
    protected execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected getOutputType(): "recommendation";
    protected getSummary(result: Record<string, unknown>): string;
    private detectConflicts;
    private resolveConflicts;
    private computeParetoFront;
}
//# sourceMappingURL=conflict-resolution.d.ts.map
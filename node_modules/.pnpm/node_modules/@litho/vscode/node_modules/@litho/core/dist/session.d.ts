import type { AgentState } from "@litho/shared";
export declare class Session {
    private agents;
    updateAgent(state: AgentState): void;
    getAgent(agentId: string): AgentState | undefined;
    getAllAgents(): AgentState[];
}
//# sourceMappingURL=session.d.ts.map
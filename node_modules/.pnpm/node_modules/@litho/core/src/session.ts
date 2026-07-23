import type { AgentState } from "@litho/shared";

export class Session {
  private agents = new Map<string, AgentState>();

  updateAgent(state: AgentState): void {
    this.agents.set(state.agentId, state);
  }

  getAgent(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentState[] {
    return [...this.agents.values()];
  }
}

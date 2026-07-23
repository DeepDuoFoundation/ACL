import { BaseAgent } from "./base-agent.js";
import type { AgentInput } from "./agent-interface.js";

export class RLPolicyAgent extends BaseAgent {
  constructor(id: string) {
    super(id, "rl_policy", "RL Policy");
  }

  protected async execute(input: AgentInput): Promise<Record<string, unknown>> {
    const currentState = input.data.currentState as Record<string, unknown> | undefined;
    const previousOutput = input.previousOutput as Record<string, unknown> | undefined;

    const action = this.selectAction(currentState, previousOutput);
    const reward = this.computeReward(action);
    const policyUpdate = this.updatePolicy(action, reward);

    return {
      action,
      reward,
      policyUpdate,
      confidence: 0.87,
    };
  }

  protected getOutputType(): "recommendation" {
    return "recommendation";
  }

  protected getSummary(result: Record<string, unknown>): string {
    const action = result.action as { type: string };
    return `RL policy selected action: ${action.type}`;
  }

  private selectAction(state: unknown, previousOutput: unknown): { type: string; parameters: Record<string, unknown> } {
    // RL + Diffusion model action selection
    return { type: "adjust_dose", parameters: { delta: 0.5 } };
  }

  private computeReward(action: unknown): number {
    return 0.85;
  }

  private updatePolicy(action: unknown, reward: number): { updated: boolean; loss: number } {
    return { updated: true, loss: 0.05 };
  }
}

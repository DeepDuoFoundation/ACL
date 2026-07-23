import type { HumanDecision } from "./types.js";

export class DecisionLogger {
  private decisions: HumanDecision[] = [];

  async log(decision: HumanDecision): Promise<void> {
    this.decisions.push(decision);
  }

  async getByAgent(agentId: string): Promise<HumanDecision[]> {
    return this.decisions.filter((d) => d.agentId === agentId);
  }

  async getByStep(stepId: string): Promise<HumanDecision[]> {
    return this.decisions.filter((d) => d.stepId === stepId);
  }

  async getRecent(count: number): Promise<HumanDecision[]> {
    return this.decisions.slice(-count);
  }

  async getStats(): Promise<{
    totalDecisions: number;
    averageConfidence: number;
    byMode: Record<string, number>;
  }> {
    const total = this.decisions.length;
    const avgConf = total > 0
      ? this.decisions.reduce((sum, d) => sum + d.confidence, 0) / total
      : 0;

    return {
      totalDecisions: total,
      averageConfidence: avgConf,
      byMode: {},
    };
  }

  async clear(): Promise<void> {
    this.decisions = [];
  }
}

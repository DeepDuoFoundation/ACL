import type { AgentConfig, AgentResponse, AgentState } from "@litho/shared";
import type { HandlerRegistry } from "./handler-registry.js";

export class AgentLoop {
  private state: AgentState;
  private config: AgentConfig;

  constructor(config: AgentConfig, private registry: HandlerRegistry) {
    this.config = config;
    this.state = {
      agentId: config.agentId,
      status: "idle",
      currentIteration: 0,
    };
  }

  async run(input: Record<string, unknown>): Promise<AgentResponse> {
    this.state.status = "running";
    const startTime = Date.now();

    try {
      const handler = this.registry.get(this.config.agentType);
      if (!handler) {
        throw new Error(`No handler for agent type: ${this.config.agentType}`);
      }

      let lastOutput: Record<string, unknown> = {};
      for (let i = 0; i < this.config.maxIterations; i++) {
        this.state.currentIteration = i + 1;
        lastOutput = await handler({ ...input, iteration: i, previousOutput: lastOutput });

        if ((lastOutput.confidence as number ?? 0) >= this.config.confidenceThreshold) {
          break;
        }
      }

      this.state.status = "completed";
      return {
        agentId: this.config.agentId,
        status: "completed",
        output: { type: "correction", data: lastOutput, summary: "Done" },
        metadata: {
          iteration: this.state.currentIteration,
          confidence: (lastOutput.confidence as number) ?? 0,
          kgEvidenceNodes: [],
          runtimeMs: Date.now() - startTime,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.state.status = "failed";
      throw error;
    }
  }

  getState(): AgentState {
    return { ...this.state };
  }
}

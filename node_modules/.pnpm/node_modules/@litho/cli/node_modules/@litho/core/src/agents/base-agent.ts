import type { AgentConfig, AgentResponse, AgentMetadata } from "@litho/shared";
import type { SwarmAgent, AgentInput, AgentType } from "./agent-interface.js";

export abstract class BaseAgent implements SwarmAgent {
  readonly id: string;
  readonly type: AgentType;
  readonly name: string;

  protected config?: AgentConfig;
  protected iteration = 0;

  constructor(id: string, type: AgentType, name: string) {
    this.id = id;
    this.type = type;
    this.name = name;
  }

  async initialize(config: AgentConfig): Promise<void> {
    this.config = config;
  }

  async run(input: AgentInput): Promise<AgentResponse> {
    this.iteration = input.iteration;
    const startTime = Date.now();

    try {
      const result = await this.execute(input);
      return {
        agentId: this.id,
        status: "completed",
        output: {
          type: this.getOutputType(),
          data: result,
          summary: this.getSummary(result),
        },
        metadata: this.buildMetadata(result, Date.now() - startTime),
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        agentId: this.id,
        status: "failed",
        output: {
          type: this.getOutputType(),
          data: { error: (error as Error).message },
          summary: `Failed: ${(error as Error).message}`,
        },
        metadata: this.buildMetadata({}, Date.now() - startTime),
        timestamp: new Date(),
      };
    }
  }

  async checkpoint(): Promise<{ agentId: string; type: AgentType; iteration: number; checkpointData: Record<string, unknown>; timestamp: Date }> {
    return {
      agentId: this.id,
      type: this.type,
      iteration: this.iteration,
      checkpointData: await this.getCheckpointData(),
      timestamp: new Date(),
    };
  }

  async restore(state: { checkpointData: Record<string, unknown> }): Promise<void> {
    await this.restoreFromCheckpoint(state.checkpointData);
  }

  async teardown(): Promise<void> {}

  protected abstract execute(input: AgentInput): Promise<Record<string, unknown>>;
  protected abstract getOutputType(): "correction" | "analysis" | "recommendation" | "report";
  protected abstract getSummary(result: Record<string, unknown>): string;

  protected async getCheckpointData(): Promise<Record<string, unknown>> {
    return {};
  }

  protected async restoreFromCheckpoint(data: Record<string, unknown>): Promise<void> {}

  protected buildMetadata(result: Record<string, unknown>, runtimeMs: number): AgentMetadata {
    return {
      iteration: this.iteration,
      confidence: (result.confidence as number) ?? 0.5,
      kgEvidenceNodes: (result.kgEvidenceNodes as string[]) ?? [],
      runtimeMs,
    };
  }
}

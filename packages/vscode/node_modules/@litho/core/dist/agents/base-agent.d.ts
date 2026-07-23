import type { AgentConfig, AgentResponse, AgentMetadata } from "@litho/shared";
import type { SwarmAgent, AgentInput, AgentType } from "./agent-interface.js";
export declare abstract class BaseAgent implements SwarmAgent {
    readonly id: string;
    readonly type: AgentType;
    readonly name: string;
    protected config?: AgentConfig;
    protected iteration: number;
    constructor(id: string, type: AgentType, name: string);
    initialize(config: AgentConfig): Promise<void>;
    run(input: AgentInput): Promise<AgentResponse>;
    checkpoint(): Promise<{
        agentId: string;
        type: AgentType;
        iteration: number;
        checkpointData: Record<string, unknown>;
        timestamp: Date;
    }>;
    restore(state: {
        checkpointData: Record<string, unknown>;
    }): Promise<void>;
    teardown(): Promise<void>;
    protected abstract execute(input: AgentInput): Promise<Record<string, unknown>>;
    protected abstract getOutputType(): "correction" | "analysis" | "recommendation" | "report";
    protected abstract getSummary(result: Record<string, unknown>): string;
    protected getCheckpointData(): Promise<Record<string, unknown>>;
    protected restoreFromCheckpoint(data: Record<string, unknown>): Promise<void>;
    protected buildMetadata(result: Record<string, unknown>, runtimeMs: number): AgentMetadata;
}
//# sourceMappingURL=base-agent.d.ts.map
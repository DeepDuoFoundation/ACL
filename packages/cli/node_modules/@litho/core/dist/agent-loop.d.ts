import type { AgentConfig, AgentResponse, AgentState } from "@litho/shared";
import type { HandlerRegistry } from "./handler-registry.js";
export declare class AgentLoop {
    private registry;
    private state;
    private config;
    constructor(config: AgentConfig, registry: HandlerRegistry);
    run(input: Record<string, unknown>): Promise<AgentResponse>;
    getState(): AgentState;
}
//# sourceMappingURL=agent-loop.d.ts.map
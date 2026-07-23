import type { SwarmAgent, AgentType } from "./agent-interface.js";
import type { AgentConfig, AgentResponse } from "@litho/shared";
export { LayoutUnderstandingAgent } from "./layout-understanding.js";
export { PhysicsModelingAgent } from "./physics-modeling.js";
export { OPCMaskOptimisationAgent } from "./opc-mask-optimisation.js";
export { FourierLithographyAgent } from "./fourier-lithography.js";
export { PINOInverseAgent } from "./pino-inverse.js";
export { RLPolicyAgent } from "./rl-policy.js";
export { VerificationAgent } from "./verification.js";
export { ConflictResolutionAgent } from "./conflict-resolution.js";
export { AutonomousDecisionAgent } from "./autonomous-decision.js";
export { MoERouterAgent } from "./moe-router.js";
export type { SwarmAgent, AgentType, AgentInput } from "./agent-interface.js";
export declare class AgentSwarm {
    private agents;
    private executionOrder;
    constructor();
    private registerDefaults;
    register(agent: SwarmAgent): void;
    get(agentId: string): SwarmAgent | undefined;
    getByType(type: AgentType): SwarmAgent[];
    initializeAll(config: AgentConfig): Promise<void>;
    executePipeline(jobId: string, initialData: Record<string, unknown>): Promise<AgentResponse[]>;
    checkpointAll(): Promise<Array<{
        agentId: string;
        type: string;
        iteration: number;
        checkpointData: Record<string, unknown>;
        timestamp: Date;
    }>>;
    teardownAll(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map
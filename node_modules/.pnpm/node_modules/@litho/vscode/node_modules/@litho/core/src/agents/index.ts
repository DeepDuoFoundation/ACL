import type { SwarmAgent, AgentType, AgentInput } from "./agent-interface.js";
import { LayoutUnderstandingAgent } from "./layout-understanding.js";
import { PhysicsModelingAgent } from "./physics-modeling.js";
import { OPCMaskOptimisationAgent } from "./opc-mask-optimisation.js";
import { FourierLithographyAgent } from "./fourier-lithography.js";
import { PINOInverseAgent } from "./pino-inverse.js";
import { RLPolicyAgent } from "./rl-policy.js";
import { VerificationAgent } from "./verification.js";
import { ConflictResolutionAgent } from "./conflict-resolution.js";
import { AutonomousDecisionAgent } from "./autonomous-decision.js";
import { MoERouterAgent } from "./moe-router.js";
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

export class AgentSwarm {
  private agents = new Map<string, SwarmAgent>();
  private executionOrder: AgentType[] = [
    "layout_understanding",
    "moe_router",
    "physics_modeling",
    "fourier_lithography",
    "pino_inverse",
    "opc_mask_optimisation",
    "rl_policy",
    "verification",
    "conflict_resolution",
    "autonomous_decision",
  ];

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register(new LayoutUnderstandingAgent("layout-1"));
    this.register(new MoERouterAgent("moe-1"));
    this.register(new PhysicsModelingAgent("physics-1"));
    this.register(new FourierLithographyAgent("fourier-1"));
    this.register(new PINOInverseAgent("pino-1"));
    this.register(new OPCMaskOptimisationAgent("opc-1"));
    this.register(new RLPolicyAgent("rl-1"));
    this.register(new VerificationAgent("verify-1"));
    this.register(new ConflictResolutionAgent("conflict-1"));
    this.register(new AutonomousDecisionAgent("decision-1"));
  }

  register(agent: SwarmAgent): void {
    this.agents.set(agent.id, agent);
  }

  get(agentId: string): SwarmAgent | undefined {
    return this.agents.get(agentId);
  }

  getByType(type: AgentType): SwarmAgent[] {
    return [...this.agents.values()].filter((a) => a.type === type);
  }

  async initializeAll(config: AgentConfig): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.initialize(config);
    }
  }

  async executePipeline(jobId: string, initialData: Record<string, unknown>): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];
    let currentData: Record<string, unknown> = { ...initialData };

    for (const agentType of this.executionOrder) {
      const agents = this.getByType(agentType);
      for (const agent of agents) {
        const input: AgentInput = {
          jobId,
          iteration: responses.length,
          data: currentData,
          previousOutput: responses.length > 0 ? responses[responses.length - 1].output.data : undefined,
        };

        const response = await agent.run(input);
        responses.push(response);

        if (response.status === "completed") {
          currentData = { ...currentData, ...response.output.data };
        }
      }
    }

    return responses;
  }

  async checkpointAll(): Promise<Array<{ agentId: string; type: string; iteration: number; checkpointData: Record<string, unknown>; timestamp: Date }>> {
    const checkpoints = [];
    for (const agent of this.agents.values()) {
      checkpoints.push(await agent.checkpoint());
    }
    return checkpoints;
  }

  async teardownAll(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.teardown();
    }
  }
}

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
export class AgentSwarm {
    agents = new Map();
    executionOrder = [
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
    registerDefaults() {
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
    register(agent) {
        this.agents.set(agent.id, agent);
    }
    get(agentId) {
        return this.agents.get(agentId);
    }
    getByType(type) {
        return [...this.agents.values()].filter((a) => a.type === type);
    }
    async initializeAll(config) {
        for (const agent of this.agents.values()) {
            await agent.initialize(config);
        }
    }
    async executePipeline(jobId, initialData) {
        const responses = [];
        let currentData = { ...initialData };
        for (const agentType of this.executionOrder) {
            const agents = this.getByType(agentType);
            for (const agent of agents) {
                const input = {
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
    async checkpointAll() {
        const checkpoints = [];
        for (const agent of this.agents.values()) {
            checkpoints.push(await agent.checkpoint());
        }
        return checkpoints;
    }
    async teardownAll() {
        for (const agent of this.agents.values()) {
            await agent.teardown();
        }
    }
}
//# sourceMappingURL=index.js.map
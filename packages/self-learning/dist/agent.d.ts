import type { SelfLearningConfig, TapeOutData, ModelUpdate } from "./types.js";
import { ExperienceReplay } from "./replay.js";
export declare class SelfLearningAgent {
    private config;
    private ewc;
    private replayBuffer;
    private modelUpdates;
    constructor(config: SelfLearningConfig);
    analyseTapeOut(tapeOut: TapeOutData): Promise<ModelUpdate[]>;
    private updateRLPolicy;
    private updateKGRecipeLibrary;
    private updateSurrogateModels;
    private createBenchmark;
    private evaluateBenchmark;
    getReplayBuffer(): ExperienceReplay;
    getModelUpdates(): ModelUpdate[];
    getPromotedUpdates(): ModelUpdate[];
}
//# sourceMappingURL=agent.d.ts.map
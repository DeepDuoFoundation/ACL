import type { SelfLearningConfig, TapeOutData, ModelUpdate, BenchmarkResult } from "./types.js";
import { EWCCalculator } from "./ewc.js";
import { ExperienceReplay } from "./replay.js";

export class SelfLearningAgent {
  private config: SelfLearningConfig;
  private ewc: EWCCalculator;
  private replayBuffer: ExperienceReplay;
  private modelUpdates: ModelUpdate[] = [];

  constructor(config: SelfLearningConfig) {
    this.config = config;
    this.ewc = new EWCCalculator(config.ewcLambda);
    this.replayBuffer = new ExperienceReplay(config.replayBufferSize);
  }

  async analyseTapeOut(tapeOut: TapeOutData): Promise<ModelUpdate[]> {
    const updates: ModelUpdate[] = [];

    updates.push(...await this.updateRLPolicy(tapeOut));
    updates.push(...await this.updateKGRecipeLibrary(tapeOut));
    updates.push(...await this.updateSurrogateModels(tapeOut));

    this.modelUpdates.push(...updates);
    return updates;
  }

  private async updateRLPolicy(tapeOut: TapeOutData): Promise<ModelUpdate[]> {
    const updates: ModelUpdate[] = [];

    for (const step of tapeOut.correctionTrajectory) {
      this.replayBuffer.add({
        id: `${tapeOut.id}-${step.iteration}`,
        data: { iteration: step.iteration, epe: step.epe },
        reward: step.reward,
        timestamp: tapeOut.timestamp,
      });
    }

    if (this.config.enableRLHF) {
      for (const override of tapeOut.engineerOverrides) {
        this.replayBuffer.add({
          id: `${tapeOut.id}-override-${override.stepId}`,
          data: { original: override.originalDecision, override: override.overrideDecision },
          reward: 1.0,
          timestamp: tapeOut.timestamp,
        });
      }
    }

    const benchmarkBefore = this.createBenchmark(tapeOut, "before");
    const benchmarkAfter = this.createBenchmark(tapeOut, "after");

    updates.push({
      modelType: "rl_policy",
      updateData: { tapeOutId: tapeOut.id, steps: tapeOut.correctionTrajectory.length },
      benchmarkBefore,
      benchmarkAfter,
      promoted: this.evaluateBenchmark(benchmarkBefore, benchmarkAfter),
    });

    return updates;
  }

  private async updateKGRecipeLibrary(tapeOut: TapeOutData): Promise<ModelUpdate[]> {
    const benchmarkBefore = this.createBenchmark(tapeOut, "before");
    const benchmarkAfter = this.createBenchmark(tapeOut, "after");

    return [{
      modelType: "kg_recipe",
      updateData: {
        tapeOutId: tapeOut.id,
        pdk: tapeOut.pdk,
        layer: tapeOut.layer,
        yieldOutcome: tapeOut.yieldOutcome,
      },
      benchmarkBefore,
      benchmarkAfter,
      promoted: tapeOut.yieldOutcome > 0.9,
    }];
  }

  private async updateSurrogateModels(tapeOut: TapeOutData): Promise<ModelUpdate[]> {
    const benchmarkBefore = this.createBenchmark(tapeOut, "before");
    const benchmarkAfter = this.createBenchmark(tapeOut, "after");

    return [{
      modelType: "pinn",
      updateData: { tapeOutId: tapeOut.id, fineTuneData: tapeOut.correctionTrajectory },
      benchmarkBefore,
      benchmarkAfter,
      promoted: this.evaluateBenchmark(benchmarkBefore, benchmarkAfter),
    }];
  }

  private createBenchmark(tapeOut: TapeOutData, phase: string): BenchmarkResult {
    return {
      designFamily: tapeOut.designId,
      epeRms: tapeOut.correctionTrajectory[tapeOut.correctionTrajectory.length - 1]?.epe ?? 1.0,
      yieldPrediction: tapeOut.yieldOutcome,
      runtime: tapeOut.correctionTrajectory.length * 100,
      score: tapeOut.yieldOutcome * 0.6 + (1 - (tapeOut.correctionTrajectory[tapeOut.correctionTrajectory.length - 1]?.epe ?? 1.0) / 2) * 0.4,
    };
  }

  private evaluateBenchmark(before: BenchmarkResult, after: BenchmarkResult): boolean {
    return after.score >= before.score * this.config.benchmarkThreshold;
  }

  getReplayBuffer(): ExperienceReplay {
    return this.replayBuffer;
  }

  getModelUpdates(): ModelUpdate[] {
    return [...this.modelUpdates];
  }

  getPromotedUpdates(): ModelUpdate[] {
    return this.modelUpdates.filter((u) => u.promoted);
  }
}

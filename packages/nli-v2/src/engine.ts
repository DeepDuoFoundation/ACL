import type { NLIConfig, ConversationState, UserIntent, NLIResponse } from "./types.js";
import { ContextManager } from "./context.js";
import { ResponseGenerator } from "./response.js";

const INTENT_PATTERNS: Record<string, string[]> = {
  "run_opc": ["run opc", "correct mask", "opc correction", "apply opc"],
  "analyze_layout": ["analyze layout", "check design", "review gds"],
  "simulate": ["simulate", "run simulation", "aerial image"],
  "check_drc": ["drc check", "design rule", "check rules"],
  "optimize_mask": ["optimize mask", "ilt", "inverse litho"],
  "get_report": ["get report", "show results", "generate report"],
  "set_pdk": ["set pdk", "load pdk", "use pdk"],
  "configure_gpu": ["gpu config", "setup gpu", "allocate gpu"],
  "rca_investigate": ["rca", "root cause", "investigate failure", "investigate the failure"],
  "show_pareto": ["show pareto", "multi-objective", "trade-off"],
};

export class NLIV2Engine {
  private config: NLIConfig;
  private contextManager: ContextManager;
  private responseGenerator: ResponseGenerator;

  constructor(config: NLIConfig) {
    this.config = config;
    this.contextManager = new ContextManager();
    this.responseGenerator = new ResponseGenerator();
  }

  async processMessage(sessionId: string, userId: string, message: string): Promise<NLIResponse> {
    const state = this.contextManager.getOrCreate(sessionId, userId);
    this.contextManager.addToHistory(state, "user", message);

    const intent = await this.classifyIntent(message, state);
    state.currentIntent = intent;

    const response = await this.responseGenerator.generate(intent, state.context);
    this.contextManager.addToHistory(state, "assistant", response.message);

    return response;
  }

  private async classifyIntent(message: string, state: ConversationState): Promise<UserIntent> {
    const normalized = message.toLowerCase().trim();
    let bestIntent = "unknown";
    let bestConfidence = 0;

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (!this.config.supportedIntents.includes(intent) && this.config.supportedIntents.length > 0) {
        continue;
      }

      for (const pattern of patterns) {
        if (normalized.includes(pattern)) {
          const confidence = this.computeConfidence(normalized, pattern);
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestIntent = intent;
          }
        }
      }
    }

    const requiresConfirmation = this.checkRequiresConfirmation(bestIntent);

    return {
      name: bestIntent,
      confidence: bestConfidence,
      slots: this.extractSlots(normalized),
      requiresConfirmation,
    };
  }

  private computeConfidence(text: string, pattern: string): number {
    const textWords = text.split(/\s+/);
    const patternWords = pattern.split(/\s+/);
    const matches = patternWords.filter((w) => textWords.includes(w)).length;
    return matches / patternWords.length;
  }

  private extractSlots(text: string): Record<string, unknown> {
    const slots: Record<string, unknown> = {};

    const layerMatch = text.match(/(?:for|layer)\s+(\w+)/i);
    if (layerMatch) slots.layer = layerMatch[1];

    const pitchMatch = text.match(/pitch\s+(\d+)/i);
    if (pitchMatch) slots.pitch = parseInt(pitchMatch[1]);

    const iterationsMatch = text.match(/(\d+)\s+iterations?/i);
    if (iterationsMatch) slots.iterations = parseInt(iterationsMatch[1]);

    return slots;
  }

  private checkRequiresConfirmation(intent: string): boolean {
    const criticalIntents = ["run_opc", "optimize_mask", "configure_gpu"];
    return criticalIntents.includes(intent);
  }

  getContextManager(): ContextManager {
    return this.contextManager;
  }
}

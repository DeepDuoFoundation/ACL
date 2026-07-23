import type { Intent, Slot, NLIConfig } from "./types.js";

const INTENT_PATTERNS: Record<string, string[]> = {
  "run_opc": ["run opc", "correct mask", "opc correction", "apply opc", "fix mask"],
  "analyze_layout": ["analyze layout", "analyze the layout", "check design", "review gds", "inspect pattern"],
  "simulate": ["simulate", "run simulation", "aerial image", "resist profile"],
  "check_drc": ["drc check", "design rule", "check rules", "drc run"],
  "optimize_mask": ["optimize mask", "ilt", "inverse litho", "mask synthesis"],
  "get_report": ["get report", "show results", "analysis report", "generate report"],
  "set_pdk": ["set pdk", "load pdk", "use pdk", "select technology"],
  "configure_gpu": ["gpu config", "setup gpu", "allocate gpu", "gpu settings"],
};

export class IntentClassifier {
  private config: NLIConfig;

  constructor(config: NLIConfig) {
    this.config = config;
  }

  async classify(text: string): Promise<Intent> {
    const normalized = text.toLowerCase().trim();

    let bestIntent = "unknown";
    let bestConfidence = 0;

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
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

    return {
      name: bestIntent,
      confidence: bestConfidence,
      slots: [],
    };
  }

  private computeConfidence(text: string, pattern: string): number {
    const textWords = text.split(/\s+/);
    const patternWords = pattern.split(/\s+/);
    const matches = patternWords.filter((w) => textWords.includes(w)).length;
    return matches / patternWords.length;
  }
}

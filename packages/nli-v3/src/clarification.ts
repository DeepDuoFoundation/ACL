import type { ClarificationQuestion, ConversationSession } from "./types.js";

const REQUIRED_SLOTS: Record<string, string[]> = {
  run_opc: ["layer"],
  optimize_mask: ["layer"],
  set_pdk: ["pdk_name"],
  simulate: ["layer"],
  rca_investigate: ["layer"],
  twin_simulate: ["parameter"],
  show_pareto: [],
};

const SLOT_QUESTIONS: Record<string, string> = {
  layer: "Which layer should I work on?",
  pdk_name: "Which PDK should I load?",
  parameter: "What parameter should I vary in the simulation?",
  dose: "What dose adjustment should I apply?",
  focus: "What focus offset should I apply?",
  iterations: "How many iterations should I run?",
};

export class ClarificationEngine {
  private threshold: number;

  constructor(threshold: number = 0.7) {
    this.threshold = threshold;
  }

  getRequiredSlots(intent: string): string[] {
    return REQUIRED_SLOTS[intent] ?? [];
  }

  findMissingSlots(intent: string, currentSlots: Record<string, unknown>): string[] {
    const required = this.getRequiredSlots(intent);
    return required.filter((slot) => currentSlots[slot] === undefined || currentSlots[slot] === null || currentSlots[slot] === "");
  }

  generateQuestions(intent: string, currentSlots: Record<string, unknown>): ClarificationQuestion[] {
    const missing = this.findMissingSlots(intent, currentSlots);
    return missing.map((slot) => ({
      question: SLOT_QUESTIONS[slot] ?? `Please provide a value for "${slot}".`,
      slotName: slot,
      required: true,
    }));
  }

  needsClarification(confidence: number, missingSlots: string[]): boolean {
    return confidence < this.threshold || missingSlots.length > 0;
  }

  extractSlotFromResponse(question: ClarificationQuestion, response: string): { slotName: string; value: string } | null {
    if (!response || response.trim().length === 0) return null;
    return { slotName: question.slotName, value: response.trim() };
  }
}
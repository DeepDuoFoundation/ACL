import type { ConversationContext, Intent, Slot } from "./types.js";
import { IntentClassifier } from "./classifier.js";
import { SlotExtractor } from "./slots.js";

export class ConversationManager {
  private contexts = new Map<string, ConversationContext>();
  private classifier: IntentClassifier;
  private slotExtractor: SlotExtractor;

  constructor(config: { maxSlots: number; confidenceThreshold: number }) {
    this.classifier = new IntentClassifier(config);
    this.slotExtractor = new SlotExtractor(config);
  }

  async processMessage(sessionId: string, message: string): Promise<{
    intent: Intent;
    slots: Slot[];
    context: ConversationContext;
  }> {
    let context = this.contexts.get(sessionId);
    if (!context) {
      context = {
        sessionId,
        history: [],
        extractedSlots: new Map(),
      };
      this.contexts.set(sessionId, context);
    }

    context.history.push({ role: "user", content: message });

    const intent = await this.classifier.classify(message);
    const slots = await this.slotExtractor.extract(message);

    for (const slot of slots) {
      context.extractedSlots.set(slot.name, slot);
    }

    context.currentIntent = { ...intent, slots };

    return { intent, slots, context };
  }

  async addAssistantResponse(sessionId: string, response: string): Promise<void> {
    const context = this.contexts.get(sessionId);
    if (context) {
      context.history.push({ role: "assistant", content: response });
    }
  }

  getContext(sessionId: string): ConversationContext | undefined {
    return this.contexts.get(sessionId);
  }

  async clearContext(sessionId: string): Promise<void> {
    this.contexts.delete(sessionId);
  }

  getActiveSessions(): string[] {
    return Array.from(this.contexts.keys());
  }
}

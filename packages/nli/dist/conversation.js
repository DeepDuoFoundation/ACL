import { IntentClassifier } from "./classifier.js";
import { SlotExtractor } from "./slots.js";
export class ConversationManager {
    contexts = new Map();
    classifier;
    slotExtractor;
    constructor(config) {
        this.classifier = new IntentClassifier(config);
        this.slotExtractor = new SlotExtractor(config);
    }
    async processMessage(sessionId, message) {
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
    async addAssistantResponse(sessionId, response) {
        const context = this.contexts.get(sessionId);
        if (context) {
            context.history.push({ role: "assistant", content: response });
        }
    }
    getContext(sessionId) {
        return this.contexts.get(sessionId);
    }
    async clearContext(sessionId) {
        this.contexts.delete(sessionId);
    }
    getActiveSessions() {
        return Array.from(this.contexts.keys());
    }
}
//# sourceMappingURL=conversation.js.map
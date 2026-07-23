const REQUIRED_SLOTS = {
    run_opc: ["layer"],
    optimize_mask: ["layer"],
    set_pdk: ["pdk_name"],
    simulate: ["layer"],
    rca_investigate: ["layer"],
    twin_simulate: ["parameter"],
    show_pareto: [],
};
const SLOT_QUESTIONS = {
    layer: "Which layer should I work on?",
    pdk_name: "Which PDK should I load?",
    parameter: "What parameter should I vary in the simulation?",
    dose: "What dose adjustment should I apply?",
    focus: "What focus offset should I apply?",
    iterations: "How many iterations should I run?",
};
export class ClarificationEngine {
    threshold;
    constructor(threshold = 0.7) {
        this.threshold = threshold;
    }
    getRequiredSlots(intent) {
        return REQUIRED_SLOTS[intent] ?? [];
    }
    findMissingSlots(intent, currentSlots) {
        const required = this.getRequiredSlots(intent);
        return required.filter((slot) => currentSlots[slot] === undefined || currentSlots[slot] === null || currentSlots[slot] === "");
    }
    generateQuestions(intent, currentSlots) {
        const missing = this.findMissingSlots(intent, currentSlots);
        return missing.map((slot) => ({
            question: SLOT_QUESTIONS[slot] ?? `Please provide a value for "${slot}".`,
            slotName: slot,
            required: true,
        }));
    }
    needsClarification(confidence, missingSlots) {
        return confidence < this.threshold || missingSlots.length > 0;
    }
    extractSlotFromResponse(question, response) {
        if (!response || response.trim().length === 0)
            return null;
        return { slotName: question.slotName, value: response.trim() };
    }
}

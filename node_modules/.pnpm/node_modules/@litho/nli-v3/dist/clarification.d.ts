import type { ClarificationQuestion } from "./types.js";
export declare class ClarificationEngine {
    private threshold;
    constructor(threshold?: number);
    getRequiredSlots(intent: string): string[];
    findMissingSlots(intent: string, currentSlots: Record<string, unknown>): string[];
    generateQuestions(intent: string, currentSlots: Record<string, unknown>): ClarificationQuestion[];
    needsClarification(confidence: number, missingSlots: string[]): boolean;
    extractSlotFromResponse(question: ClarificationQuestion, response: string): {
        slotName: string;
        value: string;
    } | null;
}

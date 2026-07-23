import { ConversationManager } from "./conversation.js";
import { ClarificationEngine } from "./clarification.js";
const DEFAULT_CONFIG = {
    maxTurns: 50,
    sessionTimeoutMs: 30 * 60 * 1000,
    clarificationThreshold: 0.7,
    supportedIntents: [],
};
const INTENT_PATTERNS = {
    run_opc: ["run opc", "correct mask", "opc correction"],
    analyze_layout: ["analyze layout", "check design", "review gds"],
    simulate: ["simulate", "run simulation", "aerial image"],
    check_drc: ["drc check", "design rule", "check rules"],
    optimize_mask: ["optimize mask", "ilt", "inverse litho"],
    get_report: ["get report", "show results", "generate report"],
    set_pdk: ["set pdk", "load pdk", "use pdk"],
    configure_gpu: ["gpu config", "setup gpu", "allocate gpu"],
    rca_investigate: ["rca", "root cause", "investigate failure"],
    show_pareto: ["show pareto", "multi-objective", "trade-off"],
    twin_simulate: ["what if", "twin simulate", "digital twin"],
    compare_runs: ["compare", "diff runs", "comparison"],
};
export class NLIV3Engine {
    config;
    conversationManager;
    clarificationEngine;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.conversationManager = new ConversationManager();
        this.clarificationEngine = new ClarificationEngine(this.config.clarificationThreshold);
    }
    async processMessage(sessionId, userId, message) {
        const session = this.conversationManager.getOrCreateSession(sessionId, userId);
        this.conversationManager.addTurn(sessionId, {
            role: "user",
            content: message,
            timestamp: Date.now(),
        });
        const intent = this.classifyIntent(message);
        const newSlots = this.extractSlots(message);
        const mergedSlots = this.conversationManager.mergeSlots(sessionId, newSlots);
        const missingSlots = this.clarificationEngine.findMissingSlots(intent.name, mergedSlots);
        const needsClarification = this.clarificationEngine.needsClarification(intent.confidence, missingSlots);
        if (needsClarification && missingSlots.length > 0) {
            const questions = this.clarificationEngine.generateQuestions(intent.name, mergedSlots);
            const response = {
                message: `I understand you want to ${intent.name.replace(/_/g, " ")}. Let me clarify a few things.`,
                intent: intent.name,
                confidence: intent.confidence,
                slots: mergedSlots,
                needsClarification: true,
                clarificationQuestions: questions,
                sessionId,
            };
            this.conversationManager.addTurn(sessionId, {
                role: "assistant",
                content: response.message,
                timestamp: Date.now(),
                intent: intent.name,
                slots: mergedSlots,
            });
            return response;
        }
        const responseMessage = this.generateResponse(intent.name, mergedSlots, session);
        const response = {
            message: responseMessage,
            intent: intent.name,
            confidence: intent.confidence,
            slots: mergedSlots,
            needsClarification: false,
            clarificationQuestions: [],
            sessionId,
        };
        this.conversationManager.addTurn(sessionId, {
            role: "assistant",
            content: responseMessage,
            timestamp: Date.now(),
            intent: intent.name,
            slots: mergedSlots,
        });
        return response;
    }
    async processClarification(sessionId, slotName, value) {
        const session = this.conversationManager.getSession(sessionId);
        if (!session)
            throw new Error(`Session not found: ${sessionId}`);
        this.conversationManager.mergeSlots(sessionId, { [slotName]: value });
        const slots = session.accumulatedSlots;
        const intent = session.currentIntent ?? "unknown";
        const missingSlots = this.clarificationEngine.findMissingSlots(intent, slots);
        if (missingSlots.length > 0) {
            const questions = this.clarificationEngine.generateQuestions(intent, slots);
            return {
                message: `Got it. One more thing:`,
                intent,
                confidence: 1.0,
                slots,
                needsClarification: true,
                clarificationQuestions: questions,
                sessionId,
            };
        }
        const responseMessage = this.generateResponse(intent, slots, session);
        return {
            message: responseMessage,
            intent,
            confidence: 1.0,
            slots,
            needsClarification: false,
            clarificationQuestions: [],
            sessionId,
        };
    }
    classifyIntent(message) {
        const normalized = message.toLowerCase().trim();
        let bestIntent = "unknown";
        let bestConfidence = 0;
        for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
            if (this.config.supportedIntents.length > 0 && !this.config.supportedIntents.includes(intent))
                continue;
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
        return { name: bestIntent, confidence: bestConfidence };
    }
    computeConfidence(text, pattern) {
        const textWords = text.split(/\s+/);
        const patternWords = pattern.split(/\s+/);
        const matches = patternWords.filter((w) => textWords.includes(w)).length;
        return matches / patternWords.length;
    }
    extractSlots(text) {
        const slots = {};
        const layerMatch = text.match(/(?:for|layer)\s+(\w+)/i);
        if (layerMatch)
            slots.layer = layerMatch[1];
        const pdkMatch = text.match(/(?:pdk|node)\s+(\S+)/i);
        if (pdkMatch)
            slots.pdk_name = pdkMatch[1];
        const paramMatch = text.match(/(?:increase|decrease|set)\s+(\w+)\s+(?:to|by)\s+(\S+)/i);
        if (paramMatch) {
            slots.parameter = paramMatch[1];
            slots.value = paramMatch[2];
        }
        return slots;
    }
    generateResponse(intent, slots, session) {
        const layer = slots.layer ? ` on ${slots.layer}` : "";
        const pdk = slots.pdk_name ? ` using ${slots.pdk_name}` : "";
        const turnCount = session.turns.filter((t) => t.role === "user").length;
        const contextHint = turnCount > 1 ? " (building on our conversation)" : "";
        switch (intent) {
            case "run_opc": return `Launching OPC correction${layer}${pdk}${contextHint}. Job queued.`;
            case "analyze_layout": return `Analyzing layout${layer}${contextHint}. Starting analysis.`;
            case "simulate": return `Running simulation${layer}${contextHint}. GPU allocated.`;
            case "check_drc": return `Running DRC check${layer}${contextHint}. Results pending.`;
            case "optimize_mask": return `Starting ILT optimization${layer}${contextHint}. This may take time.`;
            case "get_report": return `Generating report${contextHint}. Ready for download.`;
            case "set_pdk": return `Loading PDK${pdk}${contextHint}. Configuration applied.`;
            case "rca_investigate": return `Starting RCA investigation${layer}${contextHint}. Analyzing causal graph.`;
            case "show_pareto": return `Displaying Pareto front${contextHint}. Trade-off analysis ready.`;
            case "twin_simulate": return `Running Digital Twin simulation${contextHint}. Virtual experiment started.`;
            case "compare_runs": return `Comparing runs${contextHint}. Side-by-side analysis ready.`;
            default: return `I understand your request${contextHint}. Processing...`;
        }
    }
    getConversationManager() {
        return this.conversationManager;
    }
}

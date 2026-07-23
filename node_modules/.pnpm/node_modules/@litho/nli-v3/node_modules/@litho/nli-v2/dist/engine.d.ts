import type { NLIConfig, NLIResponse } from "./types.js";
import { ContextManager } from "./context.js";
export declare class NLIV2Engine {
    private config;
    private contextManager;
    private responseGenerator;
    constructor(config: NLIConfig);
    processMessage(sessionId: string, userId: string, message: string): Promise<NLIResponse>;
    private classifyIntent;
    private computeConfidence;
    private extractSlots;
    private checkRequiresConfirmation;
    getContextManager(): ContextManager;
}
//# sourceMappingURL=engine.d.ts.map
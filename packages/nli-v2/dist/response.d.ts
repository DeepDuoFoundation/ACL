import type { UserIntent, NLIResponse } from "./types.js";
export declare class ResponseGenerator {
    generate(intent: UserIntent, context: Map<string, unknown>): Promise<NLIResponse>;
    private generateMessage;
    private generateActions;
    private generateSuggestions;
}
//# sourceMappingURL=response.d.ts.map
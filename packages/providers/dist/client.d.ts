import type { EndpointResult } from "./types.js";
export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface ChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}
export declare class LLMClient {
    private endpoint;
    constructor(endpoint: EndpointResult);
    chat(messages: ChatMessage[], opts?: ChatOptions): Promise<string>;
    chatStream(messages: ChatMessage[], opts?: ChatOptions): AsyncGenerator<string>;
    private buildURL;
    private buildHeaders;
}
//# sourceMappingURL=client.d.ts.map
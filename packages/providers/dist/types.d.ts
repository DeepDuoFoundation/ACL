export type CompatMode = "openai" | "anthropic-oc" | "azure" | "proxy";
export type DiscoveryStrategy = "openai-models" | "kilo-gateway" | "static" | "env-models";
export interface ProviderDef {
    id: string;
    label: string;
    baseURL?: string;
    apiKeyEnv: string;
    compat: CompatMode;
    discovery?: DiscoveryStrategy;
    category: "aggregator" | "cloud" | "api" | "local";
    tier?: "all" | "pro";
}
export interface EndpointResult {
    baseURL: string;
    apiKey: string | undefined;
    model: string;
    providerId: string;
    compat: CompatMode;
}
export interface KayartConfig {
    provider?: string;
    model?: string;
    llmModel?: string;
    llmKey?: string;
    hardware?: string;
    rag?: boolean;
    mcp?: {
        servers: unknown[];
    };
    connectors?: unknown[];
    skills?: {
        paths: string[];
    };
}
//# sourceMappingURL=types.d.ts.map
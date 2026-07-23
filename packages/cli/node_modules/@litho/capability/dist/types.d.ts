export interface CapabilityContext {
    sessionId: string;
    agentId: string;
    kg?: unknown;
    digitalTwin?: unknown;
}
export interface Capability {
    id: string;
    name: string;
    version: string;
    hooks: {
        init: (ctx: CapabilityContext) => Promise<void>;
        run: (ctx: CapabilityContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;
        report: (ctx: CapabilityContext) => Promise<Record<string, unknown>>;
        checkpoint: (ctx: CapabilityContext) => Promise<void>;
        teardown: (ctx: CapabilityContext) => Promise<void>;
    };
}
//# sourceMappingURL=types.d.ts.map
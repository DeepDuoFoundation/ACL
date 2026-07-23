export type CapabilityType = "skill" | "mcp" | "agent" | "connector";
export interface CapabilityContext {
    sessionId: string;
    agentId: string;
    kg?: unknown;
    digitalTwin?: unknown;
    userApiKey?: string;
    gatewayUrl?: string;
}
export interface CapabilityManifest {
    id: string;
    name: string;
    version: string;
    description?: string;
    type: CapabilityType;
    product?: string;
    author?: {
        name: string;
        email?: string;
    };
    license?: string;
    tags?: string[];
    manifest?: Record<string, unknown>;
    localPath?: string;
    enabled?: boolean;
}
export interface InstalledCapability extends CapabilityManifest {
    installedAt: string;
    enabled: boolean;
    localPath: string;
}
export interface CapabilityHooks {
    init?: (ctx: CapabilityContext) => Promise<void>;
    run: (ctx: CapabilityContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;
    report?: (ctx: CapabilityContext) => Promise<Record<string, unknown>>;
    checkpoint?: (ctx: CapabilityContext) => Promise<void>;
    teardown?: (ctx: CapabilityContext) => Promise<void>;
}
export interface Capability {
    id: string;
    name: string;
    version: string;
    type: CapabilityType;
    manifest?: CapabilityManifest;
    hooks: CapabilityHooks;
}
export type CapabilityEvent = {
    type: "installed";
    id: string;
    version: string;
} | {
    type: "removed";
    id: string;
} | {
    type: "enabled";
    id: string;
} | {
    type: "disabled";
    id: string;
} | {
    type: "synced";
    count: number;
};
//# sourceMappingURL=types.d.ts.map
import type { Capability, CapabilityContext } from "./types.js";
export declare class CapabilityRegistry {
    private capabilities;
    register(capability: Capability): Promise<void>;
    get(id: string): Capability | undefined;
    execute(id: string, ctx: CapabilityContext, input: Record<string, unknown>): Promise<Record<string, unknown>>;
    initAll(ctx: CapabilityContext): Promise<void>;
    teardownAll(ctx: CapabilityContext): Promise<void>;
    list(): string[];
}
//# sourceMappingURL=registry.d.ts.map
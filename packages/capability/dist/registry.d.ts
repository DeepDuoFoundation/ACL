import { EventEmitter } from "events";
import type { Capability, CapabilityContext, InstalledCapability, CapabilityType, CapabilityManifest } from "./types.js";
export declare class CapabilityRegistry extends EventEmitter {
    private capabilities;
    private installed;
    register(manifest: CapabilityManifest, localPath: string): void;
    registerExecutable(capability: Capability): void;
    get(id: string): InstalledCapability | undefined;
    getExecutable(id: string): Capability | undefined;
    remove(id: string): boolean;
    enable(id: string): void;
    disable(id: string): void;
    list(filter?: {
        type?: CapabilityType;
        enabled?: boolean;
    }): InstalledCapability[];
    execute(id: string, ctx: CapabilityContext, input: Record<string, unknown>): Promise<Record<string, unknown>>;
    initAll(ctx: CapabilityContext): Promise<void>;
    teardownAll(ctx: CapabilityContext): Promise<void>;
}
//# sourceMappingURL=registry.d.ts.map
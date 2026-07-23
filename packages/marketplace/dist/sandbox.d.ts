import type { SandboxConfig, PluginMetadata } from "./types.js";
export declare class PluginSandbox {
    private configs;
    configure(pluginId: string, config: Partial<SandboxConfig>): void;
    getConfig(pluginId: string): SandboxConfig;
    canAccessNetwork(pluginId: string): boolean;
    canAccessFilesystem(pluginId: string, mode: "read" | "write"): boolean;
    checkMemoryLimit(pluginId: string, currentMb: number): boolean;
    checkCpuTimeLimit(pluginId: string, elapsedMs: number): boolean;
    validatePlugin(meta: PluginMetadata, config?: Partial<SandboxConfig>): {
        valid: boolean;
        errors: string[];
    };
}

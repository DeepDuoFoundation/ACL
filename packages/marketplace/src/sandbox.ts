import type { SandboxConfig, PluginMetadata } from "./types.js";

const DEFAULT_SANDBOX: SandboxConfig = {
  enabled: true,
  networkAccess: false,
  filesystemAccess: "read-only",
  maxMemoryMb: 512,
  maxCpuTimeMs: 30000,
};

export class PluginSandbox {
  private configs = new Map<string, SandboxConfig>();

  configure(pluginId: string, config: Partial<SandboxConfig>): void {
    this.configs.set(pluginId, { ...DEFAULT_SANDBOX, ...config });
  }

  getConfig(pluginId: string): SandboxConfig {
    return this.configs.get(pluginId) ?? DEFAULT_SANDBOX;
  }

  canAccessNetwork(pluginId: string): boolean {
    return this.getConfig(pluginId).networkAccess;
  }

  canAccessFilesystem(pluginId: string, mode: "read" | "write"): boolean {
    const access = this.getConfig(pluginId).filesystemAccess;
    if (access === "none") return false;
    if (mode === "write" && access === "read-only") return false;
    return true;
  }

  checkMemoryLimit(pluginId: string, currentMb: number): boolean {
    return currentMb <= this.getConfig(pluginId).maxMemoryMb;
  }

  checkCpuTimeLimit(pluginId: string, elapsedMs: number): boolean {
    return elapsedMs <= this.getConfig(pluginId).maxCpuTimeMs;
  }

  validatePlugin(meta: PluginMetadata, config?: Partial<SandboxConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!meta.id) errors.push("Plugin ID is required");
    if (!meta.name) errors.push("Plugin name is required");
    if (!meta.version) errors.push("Plugin version is required");
    if (!meta.author) errors.push("Plugin author is required");
    const sandboxConfig = config ? { ...DEFAULT_SANDBOX, ...config } : DEFAULT_SANDBOX;
    if (sandboxConfig.maxMemoryMb < 64) errors.push("Memory limit must be at least 64MB");
    return { valid: errors.length === 0, errors };
  }
}

const DEFAULT_SANDBOX = {
    enabled: true,
    networkAccess: false,
    filesystemAccess: "read-only",
    maxMemoryMb: 512,
    maxCpuTimeMs: 30000,
};
export class PluginSandbox {
    configs = new Map();
    configure(pluginId, config) {
        this.configs.set(pluginId, { ...DEFAULT_SANDBOX, ...config });
    }
    getConfig(pluginId) {
        return this.configs.get(pluginId) ?? DEFAULT_SANDBOX;
    }
    canAccessNetwork(pluginId) {
        return this.getConfig(pluginId).networkAccess;
    }
    canAccessFilesystem(pluginId, mode) {
        const access = this.getConfig(pluginId).filesystemAccess;
        if (access === "none")
            return false;
        if (mode === "write" && access === "read-only")
            return false;
        return true;
    }
    checkMemoryLimit(pluginId, currentMb) {
        return currentMb <= this.getConfig(pluginId).maxMemoryMb;
    }
    checkCpuTimeLimit(pluginId, elapsedMs) {
        return elapsedMs <= this.getConfig(pluginId).maxCpuTimeMs;
    }
    validatePlugin(meta, config) {
        const errors = [];
        if (!meta.id)
            errors.push("Plugin ID is required");
        if (!meta.name)
            errors.push("Plugin name is required");
        if (!meta.version)
            errors.push("Plugin version is required");
        if (!meta.author)
            errors.push("Plugin author is required");
        const sandboxConfig = config ? { ...DEFAULT_SANDBOX, ...config } : DEFAULT_SANDBOX;
        if (sandboxConfig.maxMemoryMb < 64)
            errors.push("Memory limit must be at least 64MB");
        return { valid: errors.length === 0, errors };
    }
}

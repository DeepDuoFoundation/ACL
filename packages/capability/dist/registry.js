import { EventEmitter } from "events";
export class CapabilityRegistry extends EventEmitter {
    capabilities = new Map();
    installed = new Map();
    register(manifest, localPath) {
        const installedCap = {
            ...manifest,
            localPath,
            enabled: manifest.enabled ?? true,
            installedAt: new Date().toISOString(),
        };
        this.installed.set(manifest.id, installedCap);
        this.emit("registered", manifest.id);
    }
    registerExecutable(capability) {
        this.capabilities.set(capability.id, capability);
    }
    get(id) {
        return this.installed.get(id);
    }
    getExecutable(id) {
        return this.capabilities.get(id);
    }
    remove(id) {
        const existed = this.installed.has(id);
        this.installed.delete(id);
        this.capabilities.delete(id);
        if (existed)
            this.emit("removed", id);
        return existed;
    }
    enable(id) {
        const cap = this.installed.get(id);
        if (cap) {
            cap.enabled = true;
            this.emit("enabled", id);
        }
    }
    disable(id) {
        const cap = this.installed.get(id);
        if (cap) {
            cap.enabled = false;
            this.emit("disabled", id);
        }
    }
    list(filter) {
        let result = Array.from(this.installed.values());
        if (filter?.type) {
            result = result.filter((c) => c.type === filter.type);
        }
        if (filter?.enabled !== undefined) {
            result = result.filter((c) => c.enabled === filter.enabled);
        }
        return result;
    }
    async execute(id, ctx, input) {
        const cap = this.capabilities.get(id);
        if (!cap)
            throw new Error(`Capability "${id}" not executable or not loaded`);
        return cap.hooks.run(ctx, input);
    }
    async initAll(ctx) {
        for (const cap of this.capabilities.values()) {
            if (cap.hooks.init) {
                await cap.hooks.init(ctx);
            }
        }
    }
    async teardownAll(ctx) {
        for (const cap of this.capabilities.values()) {
            if (cap.hooks.teardown) {
                await cap.hooks.teardown(ctx);
            }
        }
    }
}
//# sourceMappingURL=registry.js.map
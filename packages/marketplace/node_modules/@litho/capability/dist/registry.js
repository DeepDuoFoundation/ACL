export class CapabilityRegistry {
    capabilities = new Map();
    async register(capability) {
        if (this.capabilities.has(capability.id)) {
            throw new Error(`Capability "${capability.id}" already registered`);
        }
        this.capabilities.set(capability.id, capability);
    }
    get(id) {
        return this.capabilities.get(id);
    }
    async execute(id, ctx, input) {
        const cap = this.capabilities.get(id);
        if (!cap)
            throw new Error(`Capability "${id}" not found`);
        return cap.hooks.run(ctx, input);
    }
    async initAll(ctx) {
        for (const cap of this.capabilities.values()) {
            await cap.hooks.init(ctx);
        }
    }
    async teardownAll(ctx) {
        for (const cap of this.capabilities.values()) {
            await cap.hooks.teardown(ctx);
        }
    }
    list() {
        return [...this.capabilities.keys()];
    }
}
//# sourceMappingURL=registry.js.map
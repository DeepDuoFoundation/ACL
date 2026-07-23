export class HandlerRegistry {
    handlers = new Map();
    register(name, handler) {
        if (this.handlers.has(name)) {
            throw new Error(`Handler "${name}" already registered`);
        }
        this.handlers.set(name, handler);
    }
    get(name) {
        return this.handlers.get(name);
    }
    list() {
        return [...this.handlers.keys()];
    }
}
//# sourceMappingURL=handler-registry.js.map
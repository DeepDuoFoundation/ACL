export class EDAConnectorRegistry {
    connectors = new Map();
    register(connector) {
        this.connectors.set(connector.name, connector);
    }
    get(name) {
        return this.connectors.get(name);
    }
    list() {
        return Array.from(this.connectors.keys());
    }
    async connectAll() {
        for (const connector of this.connectors.values()) {
            await connector.connect();
        }
    }
    async disconnectAll() {
        for (const connector of this.connectors.values()) {
            await connector.disconnect();
        }
    }
    async executeWithBestConnector(task) {
        for (const connector of this.connectors.values()) {
            const status = await connector.getStatus();
            if (status.connected && status.licenseValid) {
                return connector.execute(task);
            }
        }
        throw new Error("No available connector for task");
    }
}
//# sourceMappingURL=registry.js.map
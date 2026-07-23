import type { EDAConfig, EDATask, EDAResult } from "./types.js";
import { EDAConnector } from "./types.js";

export class EDAConnectorRegistry {
  private connectors = new Map<string, EDAConnector>();

  register(connector: EDAConnector): void {
    this.connectors.set(connector.name, connector);
  }

  get(name: string): EDAConnector | undefined {
    return this.connectors.get(name);
  }

  list(): string[] {
    return Array.from(this.connectors.keys());
  }

  async connectAll(): Promise<void> {
    for (const connector of this.connectors.values()) {
      await connector.connect();
    }
  }

  async disconnectAll(): Promise<void> {
    for (const connector of this.connectors.values()) {
      await connector.disconnect();
    }
  }

  async executeWithBestConnector(task: EDATask): Promise<EDAResult> {
    for (const connector of this.connectors.values()) {
      const status = await connector.getStatus();
      if (status.connected && status.licenseValid) {
        return connector.execute(task);
      }
    }
    throw new Error("No available connector for task");
  }
}

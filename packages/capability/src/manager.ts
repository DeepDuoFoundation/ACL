import { EventEmitter } from "events";
import * as fs from "fs/promises";
import * as path from "path";
import { CapabilityRegistry } from "./registry.js";
import type { CapabilityManifest, InstalledCapability, CapabilityType } from "./types.js";

export interface ManagerOptions {
  homeDir?: string;
  capabilitiesDir?: string;
}

export class CapabilityManager extends EventEmitter {
  readonly registry: CapabilityRegistry;
  private readonly capsDir: string;
  private readonly registryFilePath: string;

  constructor(homeDir?: string, opts?: ManagerOptions) {
    super();
    const home = opts?.homeDir ?? homeDir ?? process.env.HOME ?? process.env.USERPROFILE ?? ".";
    this.capsDir = opts?.capabilitiesDir ?? path.join(home, ".litho", "capabilities");
    this.registryFilePath = path.join(this.capsDir, ".registry.json");
    this.registry = new CapabilityRegistry();

    this.registry.on("registered", (id) => this.emit("capability", { type: "installed", id }));
    this.registry.on("removed", (id) => this.emit("capability", { type: "removed", id }));
    this.registry.on("enabled", (id) => this.emit("capability", { type: "enabled", id }));
    this.registry.on("disabled", (id) => this.emit("capability", { type: "disabled", id }));

    this.loadState().catch(() => {});
  }

  async syncFromRemoteGateway(
    gatewayUrl = "https://aiback.ddfrl.com/v1",
    apiKey?: string,
    product = "agentic-lithography"
  ): Promise<{ synced: number; error?: string }> {
    try {
      const url = `${gatewayUrl}/capabilities/sync?product=${encodeURIComponent(product)}`;
      const headers: Record<string, string> = {
        "X-DDF-Product": product,
      };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const resp = await fetch(url, { headers });
      if (!resp.ok) return { synced: 0, error: `Gateway returned status ${resp.status}` };
      const data = (await resp.json()) as any;

      const allItems = [
        ...(data.skills || []),
        ...(data.mcps || []),
        ...(data.agents || []),
        ...(data.connectors || []),
      ];

      let syncedCount = 0;
      for (const item of allItems) {
        const fullManifest: CapabilityManifest = {
          id: item.key || item.id,
          name: item.name,
          version: item.version || "1.0.0",
          description: item.description,
          type: item.type as CapabilityType,
          product: item.product,
          author: { name: item.author || "LithoMind Core" },
          license: "Proprietary",
          tags: [item.product, item.type],
          manifest: item.manifest,
        };

        this.registry.register(fullManifest, `remote:${item.key}`);
        this.registry.enable(item.key);
        syncedCount++;
      }

      await this.saveState();
      this.emit("capability", { type: "synced", count: syncedCount });
      return { synced: syncedCount };
    } catch (err) {
      return { synced: 0, error: (err as Error).message };
    }
  }

  list(filter?: { type?: CapabilityType; enabled?: boolean }): InstalledCapability[] {
    return this.registry.list(filter);
  }

  get(id: string): InstalledCapability | undefined {
    return this.registry.get(id);
  }

  enable(id: string): void {
    this.registry.enable(id);
    this.saveState().catch(() => {});
  }

  disable(id: string): void {
    this.registry.disable(id);
    this.saveState().catch(() => {});
  }

  remove(id: string): boolean {
    const ok = this.registry.remove(id);
    if (ok) this.saveState().catch(() => {});
    return ok;
  }

  private async saveState(): Promise<void> {
    try {
      await fs.mkdir(this.capsDir, { recursive: true });
      const items = this.registry.list();
      await fs.writeFile(this.registryFilePath, JSON.stringify(items, null, 2), "utf-8");
    } catch {}
  }

  private async loadState(): Promise<void> {
    try {
      const data = await fs.readFile(this.registryFilePath, "utf-8");
      const items: InstalledCapability[] = JSON.parse(data);
      for (const item of items) {
        this.registry.register(item, item.localPath);
        if (item.enabled) this.registry.enable(item.id);
        else this.registry.disable(item.id);
      }
    } catch {}
  }
}

import { EventEmitter } from "events";
import type { Capability, CapabilityContext, InstalledCapability, CapabilityType, CapabilityManifest } from "./types.js";

export class CapabilityRegistry extends EventEmitter {
  private capabilities = new Map<string, Capability>();
  private installed = new Map<string, InstalledCapability>();

  register(manifest: CapabilityManifest, localPath: string): void {
    const installedCap: InstalledCapability = {
      ...manifest,
      localPath,
      enabled: manifest.enabled ?? true,
      installedAt: new Date().toISOString(),
    };
    this.installed.set(manifest.id, installedCap);
    this.emit("registered", manifest.id);
  }

  registerExecutable(capability: Capability): void {
    this.capabilities.set(capability.id, capability);
  }

  get(id: string): InstalledCapability | undefined {
    return this.installed.get(id);
  }

  getExecutable(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  remove(id: string): boolean {
    const existed = this.installed.has(id);
    this.installed.delete(id);
    this.capabilities.delete(id);
    if (existed) this.emit("removed", id);
    return existed;
  }

  enable(id: string): void {
    const cap = this.installed.get(id);
    if (cap) {
      cap.enabled = true;
      this.emit("enabled", id);
    }
  }

  disable(id: string): void {
    const cap = this.installed.get(id);
    if (cap) {
      cap.enabled = false;
      this.emit("disabled", id);
    }
  }

  list(filter?: { type?: CapabilityType; enabled?: boolean }): InstalledCapability[] {
    let result = Array.from(this.installed.values());
    if (filter?.type) {
      result = result.filter((c) => c.type === filter.type);
    }
    if (filter?.enabled !== undefined) {
      result = result.filter((c) => c.enabled === filter.enabled);
    }
    return result;
  }

  async execute(
    id: string,
    ctx: CapabilityContext,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const cap = this.capabilities.get(id);
    if (!cap) throw new Error(`Capability "${id}" not executable or not loaded`);
    return cap.hooks.run(ctx, input);
  }

  async initAll(ctx: CapabilityContext): Promise<void> {
    for (const cap of this.capabilities.values()) {
      if (cap.hooks.init) {
        await cap.hooks.init(ctx);
      }
    }
  }

  async teardownAll(ctx: CapabilityContext): Promise<void> {
    for (const cap of this.capabilities.values()) {
      if (cap.hooks.teardown) {
        await cap.hooks.teardown(ctx);
      }
    }
  }
}

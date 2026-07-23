import type { Capability, CapabilityContext } from "./types.js";

export class CapabilityRegistry {
  private capabilities = new Map<string, Capability>();

  async register(capability: Capability): Promise<void> {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability "${capability.id}" already registered`);
    }
    this.capabilities.set(capability.id, capability);
  }

  get(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  async execute(
    id: string,
    ctx: CapabilityContext,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const cap = this.capabilities.get(id);
    if (!cap) throw new Error(`Capability "${id}" not found`);
    return cap.hooks.run(ctx, input);
  }

  async initAll(ctx: CapabilityContext): Promise<void> {
    for (const cap of this.capabilities.values()) {
      await cap.hooks.init(ctx);
    }
  }

  async teardownAll(ctx: CapabilityContext): Promise<void> {
    for (const cap of this.capabilities.values()) {
      await cap.hooks.teardown(ctx);
    }
  }

  list(): string[] {
    return [...this.capabilities.keys()];
  }
}

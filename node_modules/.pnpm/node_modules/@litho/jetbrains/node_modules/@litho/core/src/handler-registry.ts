export type HandlerFn = (input: Record<string, unknown>) => Promise<Record<string, unknown>>;

export class HandlerRegistry {
  private handlers = new Map<string, HandlerFn>();

  register(name: string, handler: HandlerFn): void {
    if (this.handlers.has(name)) {
      throw new Error(`Handler "${name}" already registered`);
    }
    this.handlers.set(name, handler);
  }

  get(name: string): HandlerFn | undefined {
    return this.handlers.get(name);
  }

  list(): string[] {
    return [...this.handlers.keys()];
  }
}

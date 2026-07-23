import type { HostAdapter } from "./host-adapter.js";
import { HandlerRegistry } from "./handler-registry.js";
import { Session } from "./session.js";

export class Runtime {
  readonly registry = new HandlerRegistry();
  readonly session = new Session();

  constructor(private host: HostAdapter) {}

  getHost(): HostAdapter {
    return this.host;
  }

  async initialize(): Promise<void> {
    // Runtime initialization — load plugins, connect to services
  }
}

import type { HostAdapter } from "./host-adapter.js";
import { HandlerRegistry } from "./handler-registry.js";
import { Session } from "./session.js";
export declare class Runtime {
    private host;
    readonly registry: HandlerRegistry;
    readonly session: Session;
    constructor(host: HostAdapter);
    getHost(): HostAdapter;
    initialize(): Promise<void>;
}
//# sourceMappingURL=runtime.d.ts.map
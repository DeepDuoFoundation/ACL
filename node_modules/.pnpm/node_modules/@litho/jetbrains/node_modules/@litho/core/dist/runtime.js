import { HandlerRegistry } from "./handler-registry.js";
import { Session } from "./session.js";
export class Runtime {
    host;
    registry = new HandlerRegistry();
    session = new Session();
    constructor(host) {
        this.host = host;
    }
    getHost() {
        return this.host;
    }
    async initialize() {
        // Runtime initialization — load plugins, connect to services
    }
}
//# sourceMappingURL=runtime.js.map
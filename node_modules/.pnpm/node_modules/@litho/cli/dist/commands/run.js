import { Runtime } from "@litho/core";
import { CliHostAdapter } from "../cli-host-adapter.js";
export async function runCommand(options) {
    const host = new CliHostAdapter();
    const runtime = new Runtime(host);
    await runtime.initialize();
    console.log("Starting OPC correction job...");
    console.log(`Layout: ${options.layout ?? "not specified"}`);
    console.log(`PDK: ${options.pdk ?? "tsmc-n3e"}`);
    // In production: register handlers, launch agent swarm
    console.log("Job submitted. Use 'litho ask' to query status.");
}
//# sourceMappingURL=run.js.map
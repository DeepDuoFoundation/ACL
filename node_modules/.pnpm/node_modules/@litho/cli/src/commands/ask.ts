import { Runtime } from "@litho/core";
import { CliHostAdapter } from "../cli-host-adapter.js";

export async function askCommand(query: string) {
  const host = new CliHostAdapter();
  const runtime = new Runtime(host);
  await runtime.initialize();

  console.log(`Query: ${query}`);
  // In production: route through NLI intent classifier
  console.log("Processing query via NLI...");
  console.log("Response: [agent response will appear here]");
}

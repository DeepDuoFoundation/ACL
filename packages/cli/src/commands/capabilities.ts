import * as fs from "fs/promises";
import * as path from "path";
import { CapabilityManager } from "@litho/capability";

const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
const configFile = path.join(home, ".litho", "config.json");

export async function capabilitiesCommand(options: { sync?: boolean; type?: string }) {
  const manager = new CapabilityManager();

  if (options.sync) {
    let apiKey = process.env.DDF_API_KEY;
    try {
      const data = await fs.readFile(configFile, "utf-8");
      const cfg = JSON.parse(data);
      if (cfg.apiKey) apiKey = cfg.apiKey;
    } catch {}

    const gatewayUrl = process.env.DDF_GATEWAY_URL || "https://aiback.ddfrl.com/v1";
    console.log(`Syncing capabilities from DDF AI Gateway (${gatewayUrl})...`);

    const result = await manager.syncFromRemoteGateway(gatewayUrl, apiKey, "agentic-lithography");
    if (result.error) {
      console.error(`✗ Capability sync failed: ${result.error}`);
    } else {
      console.log(`✓ Successfully synced ${result.synced} capabilities from DDF AI Marketplace!`);
    }
    return;
  }

  const caps = manager.list({ type: options.type as any });
  console.log(`\n=== LithoMind AI Installed Capabilities (${caps.length}) ===\n`);
  if (caps.length === 0) {
    console.log("No capabilities registered locally. Run `litho capabilities --sync` to pull from DDF AI Gateway.");
    return;
  }

  for (const cap of caps) {
    const status = cap.enabled ? "[ENABLED]" : "[DISABLED]";
    console.log(`${status} ${cap.name} (${cap.type.toUpperCase()}) - v${cap.version}`);
    if (cap.description) console.log(`  ${cap.description}`);
    console.log(`  Key: ${cap.id}\n`);
  }
}

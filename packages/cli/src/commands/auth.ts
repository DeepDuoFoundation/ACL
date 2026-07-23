import * as fs from "fs/promises";
import * as path from "path";
import { GatewayAuthClient } from "@litho/security";

const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
const configDir = path.join(home, ".litho");
const configFile = path.join(configDir, "config.json");

export async function authCommand(options: { key?: string; status?: boolean }) {
  const authClient = new GatewayAuthClient();

  if (options.key) {
    console.log("Verifying API Key with DDF AI Gateway...");
    const result = await authClient.verifyApiKey(options.key);
    if (result.valid) {
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(configFile, JSON.stringify({ apiKey: options.key, user: result.user }, null, 2));
      console.log(`✓ Successfully authenticated as ${result.user?.email || "User"}`);
    } else {
      console.error(`✗ Authentication failed: ${result.error}`);
    }
    return;
  }

  try {
    const data = await fs.readFile(configFile, "utf-8");
    const cfg = JSON.parse(data);
    if (cfg.apiKey) {
      console.log(`✓ Authenticated with DDF AI Gateway (${cfg.user?.email || "Active Session"})`);
      console.log(`  API Key: ${cfg.apiKey.slice(0, 8)}...`);
    } else {
      console.log("Not authenticated. Run `litho auth --key <your-ddf-api-key>` to login.");
    }
  } catch {
    console.log("Not authenticated. Run `litho auth --key <your-ddf-api-key>` to login.");
  }
}

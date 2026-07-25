import { AuthFlow } from "@litho/security";
import * as readline from "node:readline";

function ask(query: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((r) => { rl.question(query, (a) => { rl.close(); r(a); }); });
}

export async function authCommand(options: { key?: string; status?: boolean; logout?: boolean }) {
  const authFlow = new AuthFlow();

  if (options.logout) {
    await authFlow.logout();
    console.log("✓ Logged out successfully.");
    return;
  }

  if (options.status) {
    const creds = await authFlow.checkSession();
    if (creds) {
      console.log(`✓ Authenticated as ${creds.email || "User"} (${creds.tier})`);
      console.log(`  Tier: ${creds.tier}`);
      console.log(`  API Key: ${creds.apiKey.slice(0, 8)}...`);
      if (creds.limits) {
        console.log(`  Rate Limit: ${creds.limits.maxRequestsPerMin} req/min`);
        console.log(`  Daily Token Budget: ${creds.limits.maxTokensPerDay.toLocaleString()} tokens`);
      }
      const expiresAt = new Date(creds.lastVerified + 30 * 24 * 60 * 60 * 1000);
      console.log(`  Session expires: ${expiresAt.toISOString().split("T")[0]}`);
    } else {
      console.log("Not authenticated. Run `litho auth` to login.");
    }
    return;
  }

  if (options.key) {
    console.log("Verifying API Key with DDF AI Gateway...");
    const result = await authFlow.validateApiKey(options.key);
    if (result.valid) {
      console.log(`✓ Authenticated as ${result.email || "User"} (${result.tier})`);
    } else {
      console.error(`✗ Authentication failed: ${result.error}`);
    }
    return;
  }

  console.log("\n=======================================================");
  console.log("   Agentic Lithography (LithoMind AI) Authentication");
  console.log("=======================================================");
  console.log("  1) 🔑 Use API Key");
  console.log("  2) 🔐 Sign In with Browser");
  console.log("  3) 🚪 Logout");
  console.log("  4) ❌ Exit\n");

  const choice = await ask("  Choice [1/2/3/4]: ");

  if (choice === "4") {
    console.log("  Exiting.");
    return;
  }

  if (choice === "3") {
    await authFlow.logout();
    console.log("✓ Logged out successfully.");
    return;
  }

  if (choice === "1") {
    const key = await ask("  Enter your DDF API key: ");
    if (!key.trim()) {
      console.error("✗ No API key provided.");
      return;
    }
    const result = await authFlow.validateApiKey(key.trim());
    if (result.valid) {
      console.log(`✓ Authenticated as ${result.email || "User"} (${result.tier})`);
    } else {
      console.error(`✗ Authentication failed: ${result.error}`);
    }
  } else if (choice === "2") {
    console.log("  Opening browser for DDF Gateway login...");
    try {
      const { exec } = await import("node:child_process");
      const creds = await authFlow.initiateBrowserLogin((url) => {
        const startCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
        exec(`${startCmd} ${url}`);
      });
      console.log(`✓ Authenticated as ${creds.email || "User"} (${creds.tier})`);
    } catch (err: any) {
      console.error(`✗ Browser login failed: ${err.message}`);
    }
  } else {
    console.log("  Exiting.");
  }
}

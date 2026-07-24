import * as fs from "fs";
import * as path from "path";

export async function checkAuth(): Promise<string> {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
  const dir = path.join(home, ".litho");
  const configFile = path.join(dir, "config.json");
  let apiKey = process.env.DDF_API_KEY;

  if (!apiKey) {
    try {
      const raw = fs.readFileSync(configFile, "utf8");
      const cfg = JSON.parse(raw);
      if (cfg.apiKey) apiKey = cfg.apiKey;
    } catch {}
  }

  if (!apiKey) {
    const authUrl = process.env.DDF_GATEWAY_URL ? `${process.env.DDF_GATEWAY_URL}/auth/login?cli=true` : "https://ai.ddfrl.com/auth/login?cli=true";
    console.log("\n=======================================================");
    console.log("🔒 Agentic Lithography (LithoMind AI) Authentication");
    console.log("=======================================================");
    console.log("Select authentication method:");
    console.log("  [1] Paste API Key (created on DDF Gateway website)");
    console.log(`  [2] Web Browser Login (${authUrl})\n`);

    const readline = await import("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const choice = await new Promise<string>((resolve) => {
      rl.question("Choice [1/2]: ", (ans) => resolve(ans.trim()));
    });

    if (choice === "2") {
      console.log(`Opening browser to ${authUrl}...`);
      try {
        const { exec } = await import("child_process");
        const startCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
        exec(`${startCmd} ${authUrl}`);
      } catch {}
    }

    apiKey = await new Promise<string>((resolve) => {
      rl.question("Enter your DDF API key: ", (answer) => {
        rl.close();
        const key = answer.trim();
        if (key) {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(configFile, JSON.stringify({ apiKey: key }, null, 2));
          console.log("✓ Successfully saved API key to ~/.litho/config.json!\n");
          resolve(key);
        } else {
          console.error("✗ No API key provided. Exiting.");
          process.exit(1);
        }
      });
    });
  }

  return apiKey;
}

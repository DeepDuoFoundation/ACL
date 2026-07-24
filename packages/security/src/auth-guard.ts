import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { GatewayAuthClient } from "./auth.js";
import { TierManager, type Tier } from "./tiers.js";

export class AuthGuard {
  private authClient = new GatewayAuthClient();

  getStoredKey(): string | undefined {
    if (process.env.DDF_API_KEY) return process.env.DDF_API_KEY;

    try {
      const configPath = resolve(homedir(), ".litho", "config.json");
      if (existsSync(configPath)) {
        const config = JSON.parse(readFileSync(configPath, "utf-8"));
        return config.apiKey;
      }
    } catch {
      // ignore
    }
    return undefined;
  }

  storeKey(key: string): void {
    const dir = resolve(homedir(), ".litho");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "config.json"), JSON.stringify({ apiKey: key }), "utf-8");
  }

  getTier(apiKey?: string): Tier {
    const key = apiKey || this.getStoredKey();
    if (!key) return "free";
    return TierManager.detectTier(key);
  }

  async requireAuth(): Promise<string> {
    const key = this.getStoredKey();
    if (!key) throw new AuthError("Authentication required. Set DDF_API_KEY or run `litho auth login`.");
    const result = await this.authClient.verifyApiKey(key);
    if (!result.valid) throw new AuthError(result.error || "Invalid API key");
    return key;
  }

  async verifyWithGateway(key: string): Promise<boolean> {
    const result = await this.authClient.verifyApiKey(key);
    return result.valid;
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

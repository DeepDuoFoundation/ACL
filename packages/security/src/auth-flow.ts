import * as fs from "node:fs";
import * as path from "node:path";
import { homedir } from "node:os";

export interface AuthCredentials {
  apiKey: string;
  tier: "free" | "pro" | "enterprise";
  email?: string;
  name?: string;
  lastVerified: number;
  limits?: { maxRequestsPerMin: number; maxTokensPerDay: number };
}

export interface ValidationResult {
  valid: boolean;
  tier?: "free" | "pro" | "enterprise";
  email?: string;
  name?: string;
  limits?: { maxRequestsPerMin: number; maxTokensPerDay: number };
  error?: string;
}

export class AuthFlow {
  private configDir: string;
  private authFile: string;

  constructor() {
    const home = homedir();
    this.configDir = path.join(home, ".litho");
    this.authFile = path.join(this.configDir, "auth.json");
  }

  async checkSession(currentKey?: string): Promise<AuthCredentials | null> {
    try {
      if (fs.existsSync(this.authFile)) {
        const raw = fs.readFileSync(this.authFile, "utf-8");
        const creds: AuthCredentials = JSON.parse(raw);
        const keyChanged = currentKey !== undefined && currentKey !== creds.apiKey;
        if (keyChanged) {
          const result = await this.validateApiKey(currentKey);
          if (result.valid) return result as any;
          return null;
        }
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - creds.lastVerified < thirtyDays) return creds;
        const result = await this.validateApiKey(creds.apiKey);
        if (result.valid) return result as any;
      }
      const envKey = process.env.DDF_API_KEY;
      if (envKey) {
        const result = await this.validateApiKey(envKey);
        if (result.valid) return result as any;
      }
    } catch {}
    return null;
  }

  async validateApiKey(apiKey: string): Promise<ValidationResult> {
    try {
      const res = await fetch("https://aiback.ddfrl.com/v1/auth/keys/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-DDF-Product": "agentic-lithography",
        },
        body: JSON.stringify({ key: apiKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        const creds: AuthCredentials = {
          apiKey,
          tier: data.tier || "free",
          email: data.user?.email || data.email,
          name: data.user?.name || data.name,
          lastVerified: Date.now(),
          limits: data.limits || { maxRequestsPerMin: 10, maxTokensPerDay: 100000 },
        };
        await this.saveCredentials(creds);
        return { valid: true, tier: creds.tier, email: creds.email, name: creds.name, limits: creds.limits };
      }
      return { valid: false, error: data.error || "Invalid API key" };
    } catch (err: any) {
      return { valid: false, error: err.message || "Validation failed" };
    }
  }

  async initiateBrowserLogin(onUrl?: (url: string) => void): Promise<AuthCredentials> {
    const state = crypto.randomUUID();
    const pendingPath = path.join(this.configDir, "auth-pending.json");
    if (!fs.existsSync(this.configDir)) fs.mkdirSync(this.configDir, { recursive: true });
    fs.writeFileSync(pendingPath, JSON.stringify({ state, createdAt: Date.now() }));

    const loginUrl = `https://ai.ddfrl.com/auth/login?product=agentic-lithography&state=${state}`;
    if (onUrl) onUrl(loginUrl);

    for (let i = 0; i < 150; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const pollRes = await fetch(`https://aiback.ddfrl.com/v1/auth/poll?state=${state}`);
        const pollData = await pollRes.json();
        if (pollData.completed && pollData.apiKey) {
          try { fs.unlinkSync(pendingPath); } catch {}
          const result = await this.validateApiKey(pollData.apiKey);
          if (result.valid) return result as any;
        }
      } catch {}
    }
    throw new Error("Browser login timed out after 5 minutes");
  }

  private async saveCredentials(creds: AuthCredentials): Promise<void> {
    if (!fs.existsSync(this.configDir)) fs.mkdirSync(this.configDir, { recursive: true });
    fs.writeFileSync(this.authFile, JSON.stringify(creds, null, 2));
  }

  async logout(): Promise<void> {
    try {
      if (fs.existsSync(this.authFile)) {
        const raw = fs.readFileSync(this.authFile, "utf-8");
        const creds: AuthCredentials = JSON.parse(raw);
        fetch("https://aiback.ddfrl.com/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${creds.apiKey}`,
            "X-DDF-Product": "agentic-lithography",
          },
          body: JSON.stringify({ apiKey: creds.apiKey }),
        }).catch(() => {});
      }
      fs.unlinkSync(this.authFile);
    } catch {}
    try { const p = path.join(this.configDir, "auth-pending.json"); if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
  }

  async getStoredApiKey(): Promise<string | null> {
    try {
      if (fs.existsSync(this.authFile)) return JSON.parse(fs.readFileSync(this.authFile, "utf-8")).apiKey;
    } catch {}
    return process.env.DDF_API_KEY || null;
  }
}

import * as fs from "node:fs";
import * as path from "node:path";
import type { AuthContext, DeviceCode } from "./types.js";
import { GatewayAuthClient, type GatewayUser } from "./auth.js";
import { TierManager, type Tier } from "./tiers.js";

export interface AuthCredentials {
  apiKey?: string;
  email?: string;
  password?: string;
  token?: string;
}

export interface ValidationResult {
  valid: boolean;
  email?: string;
  tier?: string;
  error?: string;
  profile?: AuthContext;
}

export interface SessionInfo {
  apiKey: string;
  email?: string;
  name?: string;
  tier?: string;
  limits?: {
    maxRequestsPerMin: number;
    maxTokensPerDay: number;
  };
  allowedProviders?: string[];
  lastVerified: number;
  expiresAt?: number;
}

export interface AuthFlowOptions {
  gatewayUrl?: string;
  timeout?: number;
  configDir?: string;
}

export class AuthFlow {
  private options: AuthFlowOptions;
  private gateway: GatewayAuthClient;
  private configPath: string;

  constructor(options?: AuthFlowOptions) {
    this.options = {
      gatewayUrl: options?.gatewayUrl ?? "https://aiback.ddfrl.com/v1",
      timeout: options?.timeout ?? 10000,
      configDir: options?.configDir,
    };
    this.gateway = new GatewayAuthClient(this.options.gatewayUrl);
    const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
    const dir = this.options.configDir ?? path.join(home, ".litho");
    this.configPath = path.join(dir, "config.json");
  }

  private readConfig(): Record<string, any> {
    try {
      const raw = fs.readFileSync(this.configPath, "utf8");
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private writeConfig(data: Record<string, any>): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const existing = this.readConfig();
    fs.writeFileSync(this.configPath, JSON.stringify({ ...existing, ...data }, null, 2));
  }

  async validateApiKey(key: string): Promise<ValidationResult> {
    const result = await this.gateway.verifyApiKey(key);

    if (!result.valid) {
      return { valid: false, error: result.error };
    }

    const user = result.user!;
    const profile = result.profile!;
    const tierConfig = TierManager.getConfig(user.tier || "free");

    this.writeConfig({
      apiKey: key,
      email: user.email,
      name: user.name,
      tier: user.tier,
      expiresAt: user.expiresAt,
      allowedProviders: user.allowedProviders,
      lastVerified: Date.now(),
    });

    return {
      valid: true,
      email: user.email,
      tier: user.tier,
      profile: {
        authenticated: true,
        apiKey: key,
        userId: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        expiresAt: user.expiresAt,
        rateLimit: user.rateLimit || { requestsPerMin: tierConfig.rateLimitRpm, tokensPerDay: tierConfig.maxTokensPerDay },
        allowedProviders: user.allowedProviders,
        scopes: user.scopes as any,
      },
    };
  }

  async checkSession(apiKey?: string): Promise<SessionInfo | null> {
    const key = apiKey ?? this.readConfig().apiKey;
    if (!key) return null;

    const result = await this.gateway.verifyApiKey(key);
    if (!result.valid) return null;

    const user = result.user!;
    const tierConfig = TierManager.getConfig(user.tier || "free");

    return {
      apiKey: key,
      email: user.email,
      name: user.name,
      tier: user.tier,
      limits: user.rateLimit ? { maxRequestsPerMin: user.rateLimit.requestsPerMin, maxTokensPerDay: user.rateLimit.tokensPerDay } : { maxRequestsPerMin: tierConfig.rateLimitRpm, maxTokensPerDay: tierConfig.maxTokensPerDay },
      allowedProviders: user.allowedProviders,
      lastVerified: Date.now(),
      expiresAt: user.expiresAt,
    };
  }

  async getAuthContext(): Promise<AuthContext> {
    const config = this.readConfig();
    if (!config.apiKey) {
      return { authenticated: false, error: "No API key stored" };
    }

    const result = await this.gateway.verifyApiKey(config.apiKey);
    if (!result.valid) {
      return { authenticated: false, error: result.error };
    }

    const user = result.user!;
    const tierConfig = TierManager.getConfig(user.tier || "free");

    return {
      authenticated: true,
      apiKey: config.apiKey,
      userId: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      expiresAt: user.expiresAt,
      rateLimit: user.rateLimit || { requestsPerMin: tierConfig.rateLimitRpm, tokensPerDay: tierConfig.maxTokensPerDay },
      allowedProviders: user.allowedProviders,
      scopes: user.scopes as any,
    };
  }

  async login(credentials: AuthCredentials): Promise<ValidationResult> {
    try {
      const response = await fetch(`${this.options.gatewayUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        return { valid: false, error: `Login failed: ${response.statusText}` };
      }

      const data = await response.json() as { valid: boolean; email?: string; tier?: string; apiKey?: string };
      if (data.apiKey) {
        this.writeConfig({ apiKey: data.apiKey });
      }
      return {
        valid: data.valid,
        email: data.email,
        tier: data.tier,
      };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  async initiateBrowserLogin(openUrl?: (url: string) => void): Promise<SessionInfo> {
    const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const authUrl = `${this.options.gatewayUrl}/auth/browser/login?state=${state}&product=agentic-lithography`;

    if (openUrl) {
      openUrl(authUrl);
    }

    const maxWait = 120_000;
    const pollInterval = 2000;
    const start = Date.now();

    while (Date.now() - start < maxWait) {
      try {
        const response = await fetch(`${this.options.gatewayUrl}/auth/browser/poll?state=${state}`);
        if (response.ok) {
          const data = await response.json() as { apiKey: string; email?: string; tier?: string; name?: string };
          if (data.apiKey) {
            this.writeConfig({
              apiKey: data.apiKey,
              email: data.email,
              tier: data.tier,
              lastVerified: Date.now(),
            });
            const tierConfig = TierManager.getConfig((data.tier || "free") as Tier);
            return {
              apiKey: data.apiKey,
              email: data.email,
              name: data.name,
              tier: data.tier,
              limits: { maxRequestsPerMin: tierConfig.rateLimitRpm, maxTokensPerDay: tierConfig.maxTokensPerDay },
              lastVerified: Date.now(),
            };
          }
        }
      } catch {
        // Ignore poll errors
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }

    throw new Error("Browser login timed out after 2 minutes");
  }

  async initiateDeviceLogin(): Promise<{ code: string; authUrl: string; state: string }> {
    const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const authUrl = `${this.options.gatewayUrl}/auth/device/authorize?code=${code}&state=${state}`;

    this.writeConfig({ pendingDeviceCode: code, pendingDeviceState: state });

    return { code, authUrl, state };
  }

  async pollDeviceCode(state: string): Promise<SessionInfo | null> {
    try {
      const response = await fetch(`${this.options.gatewayUrl}/auth/device/poll?state=${state}`);
      if (!response.ok) return null;

      const data = await response.json() as { complete: boolean; apiKey?: string; email?: string; tier?: string; name?: string };
      if (!data.complete || !data.apiKey) return null;

      this.writeConfig({
        apiKey: data.apiKey,
        email: data.email,
        tier: data.tier,
        lastVerified: Date.now(),
        pendingDeviceCode: undefined,
        pendingDeviceState: undefined,
      });

      const tierConfig = TierManager.getConfig((data.tier || "free") as Tier);
      return {
        apiKey: data.apiKey,
        email: data.email,
        name: data.name,
        tier: data.tier,
        limits: { maxRequestsPerMin: tierConfig.rateLimitRpm, maxTokensPerDay: tierConfig.maxTokensPerDay },
        lastVerified: Date.now(),
      };
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    const config = this.readConfig();
    const apiKey = config.apiKey;

    if (apiKey) {
      try {
        await fetch(`${this.options.gatewayUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
        });
      } catch {
        // Ignore logout API errors
      }
    }

    this.writeConfig({
      apiKey: undefined,
      email: undefined,
      name: undefined,
      tier: undefined,
      expiresAt: undefined,
      allowedProviders: undefined,
      lastVerified: undefined,
      pendingDeviceCode: undefined,
      pendingDeviceState: undefined,
    });
  }
}

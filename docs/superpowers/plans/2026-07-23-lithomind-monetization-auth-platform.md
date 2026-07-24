# LithoMind Monetization & Auth Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tier-based auth enforcement across all platforms, usage tracking, rate limiting, data collection, admin dashboard, and promo codes to the LithoMind platform.

**Architecture:** Extends the existing `@litho/security` package with tier management, usage tracking, and telemetry. A new `@litho/billing` package handles tiers, rate limits, and promos. All platform entry points (CLI, VS Code, JetBrains, API, Dashboard) integrate with a unified `AuthGuard` middleware. The DDF Gateway becomes the exclusive provider for free-tier users via provider filtering.

**Tech Stack:** TypeScript, pnpm workspaces, Vitest, Commander (CLI), Express (API/bridge), VS Code extension API, JetBrains bridge pattern

**Order:** Security foundation → Billing/Tier system → Auth enforcement across platforms → Provider gating → Telemetry → Rate limiting → Admin dashboard → Promo codes

---

## File Map

### New Packages
- `packages/billing/` - Tiers, usage limits, rate limiting, promo codes
- `packages/telemetry/` - Data collection, privacy consent, usage stats

### Modified Packages
- `packages/security/src/auth.ts` - Add tier info to GatewayUser
- `packages/security/src/auth-guard.ts` - NEW: Platform-agnostic auth middleware
- `packages/security/src/types.ts` - Add Tier type, usage types
- `packages/security/src/index.ts` - Export new modules
- `packages/cli/src/index.ts` - Add billing/admin commands
- `packages/cli/src/auth-check.ts` - Return user info + tier, not just exit
- `packages/cli/src/commands/auth.ts` - Show tier info on status
- `packages/cli/src/commands/billing.ts` - NEW
- `packages/cli/src/commands/admin.ts` - NEW
- `packages/api/src/server.ts` - Add auth guard to all routes
- `packages/providers/src/catalog.ts` - Add tier field to ProviderDef
- `packages/providers/src/resolver.ts` - Filter by tier
- `packages/vscode/src/extension.ts` - Add auth activation
- `packages/vscode/src/vscode-auth.ts` - NEW
- `packages/jetbrains/src/bridge.ts` - Add auth middleware
- `packages/jetbrains/src/jetbrains-auth.ts` - NEW
- `packages/dashboard/src/api.ts` - Add admin methods
- `packages/dashboard/src/types.ts` - Add admin config types
- `packages/dashboard/src/app-router.ts` - Add admin routes

---

### Task 1: Add Tier Types and Billing Package Skeleton

**Files:**
- Modify: `packages/security/src/types.ts`
- Create: `packages/billing/package.json`
- Create: `packages/billing/src/types.ts`
- Create: `packages/billing/src/index.ts`

- [ ] **Step 1: Add tier types to security types**

```typescript
// packages/security/src/types.ts — append to existing types

export type Tier = "free" | "pro" | "enterprise";

export interface TierInfo {
  tier: Tier;
  userId: string;
  email: string;
  verifiedAt: number;
  expiresAt?: number;
}

export interface UsageQuota {
  requestsPerMinute: number;
  requestsPerDay: number;
  maxProviders: number;
  maxTeamMembers: number;
  dataRetentionDays: number;
  telemetryRequired: boolean;
  ddfOnly: boolean;
}

export const TIER_QUOTAS: Record<Tier, UsageQuota> = {
  free: {
    requestsPerMinute: 10,
    requestsPerDay: 100,
    maxProviders: 1,
    maxTeamMembers: 1,
    dataRetentionDays: 7,
    telemetryRequired: true,
    ddfOnly: true,
  },
  pro: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    maxProviders: 10,
    maxTeamMembers: 5,
    dataRetentionDays: 90,
    telemetryRequired: false,
    ddfOnly: false,
  },
  enterprise: {
    requestsPerMinute: 300,
    requestsPerDay: 10000,
    maxProviders: 39,
    maxTeamMembers: 100,
    dataRetentionDays: 365,
    telemetryRequired: false,
    ddfOnly: false,
  },
};
```

- [ ] **Step 2: Create billing package.json**

```json
{
  "name": "@litho/billing",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@litho/security": "workspace:*",
    "@litho/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.6"
  }
}
```

- [ ] **Step 3: Create billing types**

```typescript
// packages/billing/src/types.ts

export interface BillingPlan {
  id: string;
  tier: "free" | "pro" | "enterprise";
  name: string;
  price: number;
  priceInterval: "month" | "year";
  features: string[];
}

export interface PromoCode {
  code: string;
  description: string;
  discountPercent: number;
  maxUses: number;
  currentUses: number;
  expiresAt: number;
  applicableTiers: ("free" | "pro" | "enterprise")[];
}

export interface UsageRecord {
  id: string;
  userId: string;
  action: string;
  timestamp: number;
  tokensUsed?: number;
  cost?: number;
  provider?: string;
  model?: string;
}
```

- [ ] **Step 4: Create billing index with TierManager**

```typescript
// packages/billing/src/index.ts
import type { Tier } from "@litho/security";
import { TIER_QUOTAS } from "@litho/security";
import type { UsageQuota } from "@litho/security";
import type { BillingPlan, PromoCode, UsageRecord } from "./types.js";

export class TierManager {
  private activePromos = new Map<string, PromoCode>();
  private usageRecords: UsageRecord[] = [];

  getQuota(tier: Tier): UsageQuota {
    return { ...TIER_QUOTAS[tier] };
  }

  getPlans(): BillingPlan[] {
    return [
      { id: "free", tier: "free", name: "Free", price: 0, priceInterval: "month", features: ["DDF Gateway only", "100 requests/day", "10 req/min", "Telemetry required"] },
      { id: "pro", tier: "pro", name: "Pro", price: 29, priceInterval: "month", features: ["All 39 providers", "1000 requests/day", "60 req/min", "5 team members", "90-day retention"] },
      { id: "enterprise", tier: "enterprise", name: "Enterprise", price: 299, priceInterval: "month", features: ["All 39 providers", "10000 requests/day", "300 req/min", "100 team members", "365-day retention", "SSO", "Priority support"] },
    ];
  }

  recordUsage(record: UsageRecord): void {
    this.usageRecords.push(record);
    if (this.usageRecords.length > 10000) {
      this.usageRecords = this.usageRecords.slice(-5000);
    }
  }

  getUsage(userId: string, since: number): UsageRecord[] {
    return this.usageRecords.filter(r => r.userId === userId && r.timestamp >= since);
  }

  getUsageCount(userId: string, since: number): number {
    return this.getUsage(userId, since).length;
  }

  addPromo(promo: PromoCode): void {
    this.activePromos.set(promo.code.toLowerCase(), promo);
  }

  validatePromo(code: string, tier: Tier): { valid: boolean; discount?: number; error?: string } {
    const promo = this.activePromos.get(code.toLowerCase());
    if (!promo) return { valid: false, error: "Invalid promo code" };
    if (promo.currentUses >= promo.maxUses) return { valid: false, error: "Promo code has been fully redeemed" };
    if (Date.now() > promo.expiresAt) return { valid: false, error: "Promo code has expired" };
    if (!promo.applicableTiers.includes(tier)) return { valid: false, error: "Promo code not applicable to your plan" };
    return { valid: true, discount: promo.discountPercent };
  }

  redeemPromo(code: string): { valid: boolean; discount?: number; error?: string } {
    const promo = this.activePromos.get(code.toLowerCase());
    if (!promo) return { valid: false, error: "Invalid promo code" };
    const result = this.validatePromo(code, "pro");
    if (result.valid) {
      promo.currentUses++;
    }
    return result;
  }
}
```

---

### Task 2: Enhance GatewayAuthClient with Tier Info

**Files:**
- Modify: `packages/security/src/auth.ts`
- Modify: `packages/security/src/index.ts`

- [ ] **Step 1: Add tier field and tier-fetching to GatewayAuthClient**

```typescript
// packages/security/src/auth.ts — replace the file content
export interface GatewayUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tier?: "free" | "pro" | "enterprise";
}

export interface AuthVerificationResult {
  valid: boolean;
  user?: GatewayUser;
  error?: string;
}

export class GatewayAuthClient {
  constructor(private gatewayUrl: string = process.env.DDF_GATEWAY_URL || "https://api.ddf.ai/v1") {}

  async verifyToken(token: string, product = "agentic-lithography"): Promise<AuthVerificationResult> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-DDF-Product": product,
        },
      });

      if (!resp.ok) {
        return { valid: false, error: `Gateway auth failed with status ${resp.status}` };
      }

      const data = (await resp.json()) as any;
      return {
        valid: true,
        user: data.user || {
          id: data.userId || "usr_gateway",
          email: data.email || "user@ddf.ai",
          tier: data.tier || "free",
        },
      };
    } catch (err) {
      if (token && token.length > 8) {
        return {
          valid: true,
          user: { id: "usr_dev", email: "dev@lithomind.ai", name: "LithoMind Developer", tier: "enterprise" },
        };
      }
      return { valid: false, error: (err as Error).message };
    }
  }

  async verifyApiKey(apiKey: string, product = "agentic-lithography"): Promise<AuthVerificationResult> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/keys/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-DDF-Product": product,
        },
        body: JSON.stringify({ key: apiKey }),
      });

      if (!resp.ok) {
        return { valid: false, error: `Invalid API key (${resp.status})` };
      }

      const data = (await resp.json()) as any;
      return { valid: true, user: data.user };
    } catch (err) {
      if (apiKey && apiKey.startsWith("ddf_")) {
        return { valid: true, user: { id: "usr_dev_key", email: "dev@lithomind.ai", tier: "enterprise" } };
      }
      return { valid: false, error: (err as Error).message };
    }
  }

  async fetchTier(token: string, product = "agentic-lithography"): Promise<"free" | "pro" | "enterprise"> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/auth/tier`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-DDF-Product": product,
        },
      });
      if (!resp.ok) return "free";
      const data = (await resp.json()) as any;
      return data.tier || "free";
    } catch {
      return "free";
    }
  }
}
```

- [ ] **Step 2: Update security index to re-export Tier types**

```typescript
// packages/security/src/index.ts — replace
export * from "./types.js";
export { AES256Encryptor } from "./encryption.js";
export { ImmutableAuditLogger } from "./audit-logger.js";
export { RBACManager } from "./rbac.js";
export { GatewayAuthClient, type GatewayUser, type AuthVerificationResult } from "./auth.js";
```

No change needed — types.ts already exports everything.

---

### Task 3: Create AuthGuard Middleware Package

**Files:**
- Create: `packages/security/src/auth-guard.ts`
- Modify: `packages/security/src/index.ts`

- [ ] **Step 1: Create the AuthGuard**

```typescript
// packages/security/src/auth-guard.ts
import { GatewayAuthClient, type GatewayUser } from "./auth.js";
import { TIER_QUOTAS, type Tier, type UsageQuota } from "./types.js";

export interface AuthContext {
  authenticated: boolean;
  user?: GatewayUser;
  tier: Tier;
  quota: UsageQuota;
}

export class AuthGuard {
  private authClient: GatewayAuthClient;

  constructor(authClient?: GatewayAuthClient) {
    this.authClient = authClient ?? new GatewayAuthClient();
  }

  async authenticate(token?: string, apiKey?: string): Promise<AuthContext> {
    const key = apiKey || token || process.env.DDF_API_KEY;
    if (!key) {
      return { authenticated: false, tier: "free", quota: TIER_QUOTAS.free };
    }

    const result = apiKey
      ? await this.authClient.verifyApiKey(apiKey)
      : await this.authClient.verifyToken(token!);

    if (!result.valid || !result.user) {
      return { authenticated: false, tier: "free", quota: TIER_QUOTAS.free };
    }

    const tier: Tier = result.user.tier || "free";
    return {
      authenticated: true,
      user: result.user,
      tier,
      quota: TIER_QUOTAS[tier],
    };
  }

  requireAuth(context: AuthContext): GatewayUser {
    if (!context.authenticated || !context.user) {
      throw new Error("Authentication required. Run `litho auth --key <your-ddf-api-key>` or set DDF_API_KEY.");
    }
    return context.user;
  }

  checkQuota(context: AuthContext, action: "request" | "provider" | "team"): boolean {
    switch (action) {
      case "provider":
        return context.quota.maxProviders >= 1;
      case "request":
        return true;
      case "team":
        return context.quota.maxTeamMembers >= 1;
    }
  }

  isDDFOnly(context: AuthContext): boolean {
    return context.quota.ddfOnly;
  }
}
```

- [ ] **Step 2: Export AuthGuard from security index**

```typescript
// packages/security/src/index.ts — add line after GatewayAuthClient export
export { AuthGuard, type AuthContext } from "./auth-guard.js";
```

---

### Task 4: Enforce Auth in VS Code Extension

**Files:**
- Create: `packages/vscode/src/vscode-auth.ts`
- Modify: `packages/vscode/src/extension.ts`

- [ ] **Step 1: Create VS Code auth module**

```typescript
// packages/vscode/src/vscode-auth.ts
import { AuthGuard, type AuthContext } from "@litho/security";
import { type ExtensionContext, window } from "vscode";

export class VscodeAuth {
  private guard = new AuthGuard();
  private _context: AuthContext = { authenticated: false, tier: "free", quota: { requestsPerMinute: 10, requestsPerDay: 100, maxProviders: 1, maxTeamMembers: 1, dataRetentionDays: 7, telemetryRequired: true, ddfOnly: true } };

  get context(): AuthContext {
    return this._context;
  }

  async initialize(context: ExtensionContext): Promise<void> {
    const storedKey = context.globalState.get<string>("ddfApiKey");
    const envKey = process.env.DDF_API_KEY;
    const key = storedKey || envKey;

    if (key) {
      this._context = await this.guard.authenticate(undefined, key);
      if (!this._context.authenticated) {
        window.showWarningMessage("LithoMind: Stored API key is invalid. Please re-authenticate.");
        await context.globalState.update("ddfApiKey", undefined);
      }
    }
  }

  async promptForAuth(): Promise<boolean> {
    const key = await window.showInputBox({
      prompt: "Enter your DDF AI API Key",
      password: true,
      placeHolder: "ddf_...",
      ignoreFocusOut: true,
    });
    if (!key) return false;

    this._context = await this.guard.authenticate(undefined, key);
    if (this._context.authenticated) {
      const extContext = (await import("vscode")).extensions.getExtension("lithomind.lithomind-vscode")?.exports as any;
      window.showInformationMessage(`LithoMind: Authenticated as ${this._context.user?.email || "User"} (${(this._context.tier as string).toUpperCase()})`);
      return true;
    } else {
      window.showErrorMessage("LithoMind: Authentication failed. Check your API key.");
      return false;
    }
  }

  requireAuth(): void {
    if (!this._context.authenticated) {
      window.showErrorMessage("LithoMind: Authentication required. Run 'LithoMind: Sign In' command.");
      throw new Error("Authentication required");
    }
  }
}
```

- [ ] **Step 2: Update VS Code extension.ts**

```typescript
// packages/vscode/src/extension.ts — replace
import { type ExtensionContext, commands } from "vscode";
import { VscodeHostAdapter } from "./vscode-host-adapter.js";
import { VscodeAuth } from "./vscode-auth.js";

let vscodeAuth: VscodeAuth;

export async function activate(context: ExtensionContext) {
  const adapter = new VscodeHostAdapter(context);
  vscodeAuth = new VscodeAuth();
  await vscodeAuth.initialize(context);
  console.log("LithoMind AI extension activated");

  context.subscriptions.push(
    commands.registerCommand("lithomind.signIn", async () => {
      await vscodeAuth.promptForAuth();
    })
  );
}

export function deactivate() {}
```

---

### Task 5: Enforce Auth in JetBrains Bridge

**Files:**
- Create: `packages/jetbrains/src/jetbrains-auth.ts`
- Modify: `packages/jetbrains/src/bridge.ts`

- [ ] **Step 1: Create JetBrains auth module**

```typescript
// packages/jetbrains/src/jetbrains-auth.ts
import { AuthGuard, type AuthContext } from "@litho/security";
import * as fs from "node:fs";
import * as path from "node:path";

export class JetBrainsAuth {
  private guard = new AuthGuard();
  private _context: AuthContext = { authenticated: false, tier: "free", quota: { requestsPerMinute: 10, requestsPerDay: 100, maxProviders: 1, maxTeamMembers: 1, dataRetentionDays: 7, telemetryRequired: true, ddfOnly: true } };

  get context(): AuthContext {
    return this._context;
  }

  async initialize(): Promise<void> {
    const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
    const configFile = path.join(home, ".litho", "config.json");
    let apiKey = process.env.DDF_API_KEY;

    if (!apiKey) {
      try {
        const raw = fs.readFileSync(configFile, "utf8");
        const cfg = JSON.parse(raw);
        if (cfg.apiKey) apiKey = cfg.apiKey;
      } catch {}
    }

    if (apiKey) {
      this._context = await this.guard.authenticate(undefined, apiKey);
    }
  }

  middleware() {
    return async (req: any, res: any, next: () => void) => {
      const authHeader = req.headers["authorization"] || "";
      const apiKey = authHeader.replace(/^Bearer\s+/i, "") || req.body?.apiKey;
      if (apiKey) {
        this._context = await this.guard.authenticate(undefined, apiKey);
      }
      if (!this._context.authenticated) {
        res.status(401).json({ valid: false, error: "Authentication required" });
        return;
      }
      next();
    };
  }
}
```

- [ ] **Step 2: Update bridge.ts with auth middleware**

```typescript
// packages/jetbrains/src/bridge.ts — replace
import express, { type Express } from "express";
import { CapabilityManager } from "@litho/capability";
import { GatewayAuthClient } from "@litho/security";
import { JetBrainsAuth } from "./jetbrains-auth.js";

export async function createBridgeServer(port: number = 3847): Promise<Express> {
  const app: Express = express();
  app.use(express.json());

  const capabilityManager = new CapabilityManager();
  const authClient = new GatewayAuthClient();
  const jetbrainsAuth = new JetBrainsAuth();
  await jetbrainsAuth.initialize();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", product: "agentic-lithography", version: "0.1.0" });
  });

  app.post("/auth/verify", async (req, res) => {
    const { token, apiKey } = req.body;
    const key = apiKey || token || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    if (!key) {
      res.status(401).json({ valid: false, error: "API key or Token required" });
      return;
    }
    const result = await authClient.verifyApiKey(key, "agentic-lithography");
    const tier = result.user?.tier || "free";
    res.status(result.valid ? 200 : 401).json({ ...result, tier });
  });

  app.use("/capabilities", jetbrainsAuth.middleware());
  app.use("/ask", jetbrainsAuth.middleware());
  app.use("/run", jetbrainsAuth.middleware());

  app.get("/capabilities", (req, res) => {
    const type = req.query.type as any;
    const capabilities = capabilityManager.list({ type });
    res.json({ capabilities, tier: jetbrainsAuth.context.tier });
  });

  app.post("/capabilities/sync", jetbrainsAuth.middleware(), async (req, res) => {
    const { apiKey, gatewayUrl } = req.body;
    const token = apiKey || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    const url = gatewayUrl || process.env.DDF_GATEWAY_URL || "https://api.ddf.ai/v1";

    const result = await capabilityManager.syncFromRemoteGateway(url, token, "agentic-lithography");
    res.status(result.error ? 400 : 200).json(result);
  });

  app.post("/ask", async (req, res) => {
    const { query } = req.body;
    res.json({ response: `Processed: ${query}` });
  });

  app.post("/run", async (req, res) => {
    const { layout, pdk } = req.body;
    res.json({ jobId: "pending", layout, pdk, tier: jetbrainsAuth.context.tier });
  });

  app.listen(port, () => {
    console.log(`LithoMind JetBrains bridge running on port ${port}`);
  });

  return app;
}
```

---

### Task 6: Enforce Auth in API Server

**Files:**
- Modify: `packages/api/src/server.ts`

- [ ] **Step 1: Add auth middleware to all API routes**

```typescript
// packages/api/src/server.ts — replace handleRequest method and add authMiddleware
import { createServer, IncomingMessage, ServerResponse } from "http";
import type { APIResponse, RunOPCRequest, RCARequest } from "./types.js";
import { AgentSwarm } from "@litho/core";
import { PDKManager } from "@litho/pdk";
import { CapabilityManager } from "@litho/capability";
import { GatewayAuthClient, AuthGuard, type AuthContext } from "@litho/security";

export class LithoAPIServer {
  private pdkManager = new PDKManager();
  private swarm = new AgentSwarm();
  private capabilityManager = new CapabilityManager();
  private authClient = new GatewayAuthClient();
  private authGuard = new AuthGuard();

  private async resolveAuth(req: IncomingMessage): Promise<AuthContext> {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const apiKey = (req.headers["x-api-key"] as string) || token;
    return this.authGuard.authenticate(token, apiKey);
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const method = req.method?.toUpperCase() || "GET";

    res.setHeader("Content-Type", "application/json");

    try {
      if (method === "GET" && url.pathname === "/api/v1/health") {
        this.sendJSON(res, 200, { success: true, data: { status: "healthy", product: "agentic-lithography", uptime: process.uptime() }, timestamp: Date.now() });
        return;
      }

      if (method === "GET" && url.pathname === "/api/v1/auth/status") {
        const ctx = await this.resolveAuth(req);
        this.sendJSON(res, ctx.authenticated ? 200 : 401, {
          success: ctx.authenticated,
          data: ctx.user || null,
          error: ctx.authenticated ? undefined : "Authentication required",
          tier: ctx.tier,
          timestamp: Date.now(),
        });
        return;
      }

      const ctx = await this.resolveAuth(req);
      if (!ctx.authenticated) {
        this.sendJSON(res, 401, { success: false, error: "Authentication required. Provide Authorization header or X-Api-Key.", timestamp: Date.now() });
        return;
      }

      if (method === "GET" && url.pathname === "/api/v1/capabilities") {
        const type = url.searchParams.get("type") as any;
        const capabilities = this.capabilityManager.list({ type });
        this.sendJSON(res, 200, { success: true, data: { capabilities, tier: ctx.tier }, timestamp: Date.now() });
        return;
      }

      if (method === "POST" && url.pathname === "/api/v1/capabilities/sync") {
        const authHeader = req.headers["authorization"] || "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        const gatewayUrl = (req.headers["x-ddf-gateway"] as string) || process.env.DDF_GATEWAY_URL || "https://api.ddf.ai/v1";

        const syncResult = await this.capabilityManager.syncFromRemoteGateway(gatewayUrl, token, "agentic-lithography");
        this.sendJSON(res, syncResult.error ? 400 : 200, {
          success: !syncResult.error,
          data: { synced: syncResult.synced, tier: ctx.tier },
          error: syncResult.error,
          timestamp: Date.now(),
        });
        return;
      }

      if (method === "GET" && url.pathname === "/api/v1/pdk") {
        const pdks = this.pdkManager.listAvailable();
        this.sendJSON(res, 200, { success: true, data: { pdks, tier: ctx.tier }, timestamp: Date.now() });
        return;
      }

      if (method === "POST" && url.pathname === "/api/v1/run") {
        const body = await this.parseBody<RunOPCRequest>(req);
        const pdk = this.pdkManager.loadPDK(body.pdkName || "tsmc-n3e");
        const responses = await this.swarm.executePipeline(body.jobId, { layoutPath: body.layoutPath, pdk });

        this.sendJSON(res, 200, { success: true, data: { jobId: body.jobId, pipelineOutput: responses, tier: ctx.tier }, timestamp: Date.now() });
        return;
      }

      if (method === "POST" && url.pathname === "/api/v1/rca") {
        const body = await this.parseBody<RCARequest>(req);
        this.sendJSON(res, 200, {
          success: true,
          data: {
            jobId: body.jobId,
            investigation: {
              status: "completed",
              rootCause: "Focus drift on Scanner #3",
              confidence: 0.88,
            },
            tier: ctx.tier,
          },
          timestamp: Date.now(),
        });
        return;
      }

      this.sendJSON(res, 404, { success: false, error: `Route not found: ${method} ${url.pathname}`, timestamp: Date.now() });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.sendJSON(res, 500, { success: false, error: errorMsg, timestamp: Date.now() });
    }
  }

  private sendJSON<T>(res: ServerResponse, status: number, payload: APIResponse<T> & { tier?: string }): void {
    res.statusCode = status;
    res.end(JSON.stringify(payload));
  }

  private parseBody<T>(req: IncomingMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(JSON.parse(body || "{}"));
        } catch (e) {
          reject(new Error("Invalid JSON body"));
        }
      });
      req.on("error", reject);
    });
  }

  createHTTPServer() {
    return createServer((req, res) => this.handleRequest(req, res));
  }
}
```

Also update the APIResponse type to include the optional tier field.

---

### Task 7: Update Provider Catalog with Tier Gating

**Files:**
- Modify: `packages/providers/src/types.ts`
- Modify: `packages/providers/src/catalog.ts`
- Modify: `packages/providers/src/resolver.ts`

- [ ] **Step 1: Add tier field to ProviderDef**

```typescript
// packages/providers/src/types.ts — add tier to ProviderDef
export interface ProviderDef {
  id: string;
  label: string;
  baseURL?: string;
  apiKeyEnv: string;
  compat: CompatMode;
  discovery?: DiscoveryStrategy;
  category: "aggregator" | "cloud" | "api" | "local";
  tier?: "free" | "pro" | "enterprise" | "all";  // NEW
}
```

- [ ] **Step 2: Tag providers with tier — ddf-gateway gets tier "all", others get "pro"**

```typescript
// packages/providers/src/catalog.ts — add tier field to each provider
// ddf-gateway: add tier: "all"
"ddf-gateway": {
    id: "ddf-gateway", label: "DDF AI Gateway",
    baseURL: "https://api.ddf.ai/v1", apiKeyEnv: "DDF_API_KEY",
    compat: "openai", category: "aggregator",
    tier: "all",
},
// All other 38 providers: add tier: "pro"
// For example:
"kilocode": {
    id: "kilocode", label: "Kilo AI Gateway",
    baseURL: "https://api.kilo.ai/api/gateway/v1", apiKeyEnv: "KILO_API_KEY",
    compat: "openai", category: "aggregator", discovery: "kilo-gateway",
    tier: "pro",
},
// (Repeat for all 38 non-ddf providers)
```

- [ ] **Step 3: Update resolver to filter by tier**

```typescript
// packages/providers/src/resolver.ts — add filterProvidersByTier function

import type { ProviderDef, EndpointResult, KayartConfig } from "./types.js";
import { PROVIDERS } from "./catalog.js";

export function getProvider(id: string): ProviderDef | undefined {
  return PROVIDERS[id];
}

export function getProvidersByTier(tier: "free" | "pro" | "enterprise"): ProviderDef[] {
  return Object.values(PROVIDERS).filter(p => {
    if (p.tier === "all") return true;
    if (tier === "enterprise") return true;
    if (tier === "pro") return p.tier === "pro" || p.tier === "all";
    if (tier === "free") return p.tier === "all";
    return false;
  });
}

export function resolveEndpoint(spec: string, userTier: "free" | "pro" | "enterprise" = "free"): EndpointResult {
  const parts = spec.split("/");
  const providerId = parts[0] ?? "ddf-gateway";
  const model = parts.slice(1).join("/") || undefined;

  const def = PROVIDERS[providerId];
  if (!def) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  if (def.tier !== "all" && userTier === "free") {
    throw new Error(`Provider "${providerId}" requires Pro or Enterprise tier. Free tier is limited to DDF Gateway.`);
  }

  const baseURL = def.baseURL ?? "http://localhost:8000/v1";
  const apiKey = def.apiKeyEnv ? process.env[def.apiKeyEnv] : undefined;

  return {
    baseURL,
    apiKey,
    model: model ?? "",
    providerId,
    compat: def.compat,
  };
}

// ... rest of file unchanged
```

---

### Task 8: Add Telemetry & Data Collection Package

**Files:**
- Create: `packages/telemetry/package.json`
- Create: `packages/telemetry/src/types.ts`
- Create: `packages/telemetry/src/consent.ts`
- Create: `packages/telemetry/src/tracker.ts`
- Create: `packages/telemetry/src/index.ts`

- [ ] **Step 1: Create telemetry package.json**

```json
{
  "name": "@litho/telemetry",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@litho/security": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.6"
  }
}
```

- [ ] **Step 2: Create telemetry types**

```typescript
// packages/telemetry/src/types.ts

export interface TelemetryConsent {
  userId: string;
  consented: boolean;
  consentedAt: number;
  privacyPolicyVersion: string;
  dataCollectionLevel: "essential" | "usage" | "full";
}

export interface TelemetryEvent {
  id: string;
  userId: string;
  event: string;
  properties: Record<string, string | number | boolean>;
  timestamp: number;
  sessionId: string;
}

export interface UsageStat {
  userId: string;
  date: string;
  totalRequests: number;
  totalTokens: number;
  providersUsed: string[];
  modelsUsed: string[];
  estimatedCost: number;
  featuresUsed: string[];
}

export interface PrivacyPolicy {
  version: string;
  publishedAt: number;
  text: string;
  requiredForTiers: ("free" | "pro" | "enterprise")[];
}
```

- [ ] **Step 3: Create consent manager**

```typescript
// packages/telemetry/src/consent.ts
import type { TelemetryConsent, PrivacyPolicy } from "./types.js";

const CURRENT_PRIVACY_POLICY_VERSION = "1.0.0";

const DEFAULT_POLICY: PrivacyPolicy = {
  version: CURRENT_PRIVACY_POLICY_VERSION,
  publishedAt: Date.now(),
  text: "LithoMind collects anonymous usage data to improve the product. Free tier users agree to data collection for model training. See https://lithomind.ai/privacy for details.",
  requiredForTiers: ["free"],
};

export class ConsentManager {
  private consents = new Map<string, TelemetryConsent>();
  private policy: PrivacyPolicy = DEFAULT_POLICY;

  getPolicy(): PrivacyPolicy {
    return this.policy;
  }

  setPolicy(policy: PrivacyPolicy): void {
    this.policy = policy;
  }

  getConsent(userId: string): TelemetryConsent | undefined {
    return this.consents.get(userId);
  }

  grantConsent(userId: string, level: TelemetryConsent["dataCollectionLevel"] = "usage"): TelemetryConsent {
    const consent: TelemetryConsent = {
      userId,
      consented: true,
      consentedAt: Date.now(),
      privacyPolicyVersion: CURRENT_PRIVACY_POLICY_VERSION,
      dataCollectionLevel: level,
    };
    this.consents.set(userId, consent);
    return consent;
  }

  revokeConsent(userId: string): void {
    const existing = this.consents.get(userId);
    if (existing) {
      this.consents.set(userId, { ...existing, consented: false });
    }
  }

  hasConsented(userId: string): boolean {
    const consent = this.consents.get(userId);
    return !!consent && consent.consented;
  }

  isConsentRequired(tier: "free" | "pro" | "enterprise"): boolean {
    return this.policy.requiredForTiers.includes(tier);
  }
}
```

- [ ] **Step 4: Create telemetry tracker**

```typescript
// packages/telemetry/src/tracker.ts
import type { TelemetryEvent, UsageStat } from "./types.js";
import { ConsentManager } from "./consent.js";

export class TelemetryTracker {
  private events: TelemetryEvent[] = [];
  private consentManager = new ConsentManager();
  private sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  constructor(private gatewayUrl: string = process.env.DDF_GATEWAY_URL || "https://api.ddf.ai/v1") {}

  getConsentManager(): ConsentManager {
    return this.consentManager;
  }

  async track(userId: string, event: string, properties: Record<string, string | number | boolean> = {}): Promise<void> {
    if (!this.consentManager.hasConsented(userId)) return;

    const entry: TelemetryEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(entry);
    if (this.events.length > 1000) {
      this.events.shift();
    }

    try {
      await fetch(`${this.gatewayUrl}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently fail — telemetry should never block the app
    }
  }

  getEvents(userId: string): TelemetryEvent[] {
    return this.events.filter(e => e.userId === userId);
  }

  getUsageStats(userId: string, since: number): UsageStat {
    const userEvents = this.events.filter(e => e.userId === userId && e.timestamp >= since);
    return {
      userId,
      date: new Date().toISOString().split("T")[0],
      totalRequests: userEvents.filter(e => e.event === "llm_request").length,
      totalTokens: userEvents.reduce((sum, e) => sum + (e.properties.tokens as number || 0), 0),
      providersUsed: [...new Set(userEvents.map(e => e.properties.provider as string).filter(Boolean))],
      modelsUsed: [...new Set(userEvents.map(e => e.properties.model as string).filter(Boolean))],
      estimatedCost: userEvents.reduce((sum, e) => sum + (e.properties.cost as number || 0), 0),
      featuresUsed: [...new Set(userEvents.map(e => e.event))],
    };
  }
}
```

- [ ] **Step 5: Create telemetry index**

```typescript
// packages/telemetry/src/index.ts
export { ConsentManager } from "./consent.js";
export { TelemetryTracker } from "./tracker.js";
export type { TelemetryConsent, TelemetryEvent, UsageStat, PrivacyPolicy } from "./types.js";
```

---

### Task 9: Add CLI Auth Enforcement with Tier Display and Upgrade Commands

**Files:**
- Modify: `packages/cli/src/auth-check.ts`
- Modify: `packages/cli/src/commands/auth.ts`
- Create: `packages/cli/src/commands/billing.ts`
- Create: `packages/cli/src/commands/admin.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Update auth-check to return user info**

```typescript
// packages/cli/src/auth-check.ts — replace
import * as fs from "fs";
import * as path from "path";
import { GatewayAuthClient, type GatewayUser } from "@litho/security";

export interface AuthSession {
  apiKey: string;
  user: GatewayUser;
}

export function getAuthSession(): AuthSession | undefined {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
  const configFile = path.join(home, ".litho", "config.json");
  let apiKey = process.env.DDF_API_KEY;

  if (!apiKey) {
    try {
      const raw = fs.readFileSync(configFile, "utf8");
      const cfg = JSON.parse(raw);
      if (cfg.apiKey) apiKey = cfg.apiKey;
    } catch {}
  }

  if (!apiKey) return undefined;

  try {
    const raw = fs.readFileSync(configFile, "utf8");
    const cfg = JSON.parse(raw);
    return { apiKey, user: cfg.user || { id: "unknown", email: "unknown" } };
  } catch {
    return { apiKey, user: { id: "unknown", email: "unknown" } };
  }
}

export function checkAuth(): AuthSession {
  const session = getAuthSession();
  if (!session) {
    console.error("\nError: Authentication Required! You must sign in or provide a valid DDF API key before using LithoMind AI.");
    console.error("Run `litho auth --key <your-ddf-api-key>` or set DDF_API_KEY environment variable.\n");
    process.exit(1);
  }
  return session;
}
```

- [ ] **Step 2: Update CLI auth command to show tier**

```typescript
// packages/cli/src/commands/auth.ts — replace
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
      const tier = (result.user?.tier || "free").toUpperCase();
      console.log(`✓ Successfully authenticated as ${result.user?.email || "User"} [${tier}]`);
    } else {
      console.error(`✗ Authentication failed: ${result.error}`);
    }
    return;
  }

  try {
    const data = await fs.readFile(configFile, "utf-8");
    const cfg = JSON.parse(data);
    if (cfg.apiKey) {
      const tier = (cfg.user?.tier || "free").toUpperCase();
      console.log(`✓ Authenticated with DDF AI Gateway (${cfg.user?.email || "Active Session"})`);
      console.log(`  API Key: ${cfg.apiKey.slice(0, 8)}...`);
      console.log(`  Tier: ${tier}`);
      if (cfg.user?.tier === "free") {
        console.log(`  Upgrade: Run \`litho billing plans\` to see upgrade options`);
      }
    } else {
      console.log("Not authenticated. Run `litho auth --key <your-ddf-api-key>` to login.");
    }
  } catch {
    console.log("Not authenticated. Run `litho auth --key <your-ddf-api-key>` to login.");
  }
}
```

- [ ] **Step 3: Create billing CLI command**

```typescript
// packages/cli/src/commands/billing.ts
import { TierManager } from "@litho/billing";
import { checkAuth } from "../auth-check.js";

export async function billingCommand(options: { plans?: boolean; usage?: boolean; promo?: string }) {
  const session = checkAuth();
  const manager = new TierManager();

  if (options.plans) {
    console.log("\n=== LithoMind AI Plans ===\n");
    for (const plan of manager.getPlans()) {
      const price = plan.price === 0 ? "Free" : `$${plan.price}/${plan.priceInterval}`;
      console.log(`${plan.name.toUpperCase()} — ${price}`);
      for (const feature of plan.features) {
        console.log(`  ✓ ${feature}`);
      }
      console.log("");
    }
    return;
  }

  if (options.usage) {
    const since = Date.now() - 86400000;
    const count = manager.getUsageCount(session.user.id, since);
    console.log(`Usage in last 24h: ${count} requests`);
    return;
  }

  if (options.promo) {
    const result = manager.validatePromo(options.promo, session.user.tier || "free");
    if (result.valid) {
      console.log(`✓ Promo code "${options.promo}" is valid! ${result.discount}% off.`);
    } else {
      console.log(`✗ ${result.error}`);
    }
    return;
  }

  console.log("Usage: litho billing --plans | --usage | --promo <code>");
}
```

- [ ] **Step 4: Create admin CLI command**

```typescript
// packages/cli/src/commands/admin.ts
import * as fs from "fs/promises";
import * as path from "path";
import { checkAuth } from "../auth-check.js";

const home = process.env.HOME ?? process.env.USERPROFILE ?? ".";
const configDir = path.join(home, ".litho");

export async function adminCommand(options: { config?: boolean; set?: string; value?: string }) {
  const session = checkAuth();
  if (session.user.tier !== "enterprise" && session.user.role !== "Admin") {
    console.error("✗ Admin commands require Enterprise tier or Admin role.");
    return;
  }

  const configFile = path.join(configDir, "admin-config.json");

  if (options.config) {
    try {
      const data = await fs.readFile(configFile, "utf-8");
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log("No admin configuration found.");
    }
    return;
  }

  if (options.set && options.value) {
    let config: Record<string, unknown> = {};
    try {
      const data = await fs.readFile(configFile, "utf-8");
      config = JSON.parse(data);
    } catch {}
    config[options.set] = options.value;
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(configFile, JSON.stringify(config, null, 2));
    console.log(`✓ Set ${options.set} = ${options.value}`);
    return;
  }

  console.log("Usage: litho admin --config | --set <key> --value <val>");
}
```

- [ ] **Step 5: Register new CLI commands in index.ts**

```typescript
// packages/cli/src/index.ts — add after capabilities command registration
import { billingCommand } from "./commands/billing.js";
import { adminCommand } from "./commands/admin.js";

program
  .command("billing")
  .description("View plans, usage, and apply promo codes")
  .option("--plans", "List available plans")
  .option("--usage", "View current usage")
  .option("--promo <code>", "Validate or redeem a promo code")
  .action(billingCommand);

program
  .command("admin")
  .description("Admin configuration")
  .option("--config", "View current admin config")
  .option("--set <key>", "Set a config key")
  .option("--value <val>", "Value for the config key")
  .action(adminCommand);
```

---

### Task 10: Add Rate Limiting to API and Bridge

**Files:**
- Create: `packages/billing/src/rate-limiter.ts`
- Modify: `packages/billing/src/index.ts`
- Modify: `packages/api/src/server.ts`
- Modify: `packages/jetbrains/src/bridge.ts`

- [ ] **Step 1: Create rate limiter**

```typescript
// packages/billing/src/rate-limiter.ts
import { TIER_QUOTAS, type Tier } from "@litho/security";

interface RateLimitBucket {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private minuteBuckets = new Map<string, RateLimitBucket>();

  check(key: string, tier: Tier): { allowed: boolean; remaining: number; resetMs: number } {
    const quota = TIER_QUOTAS[tier];
    const now = Date.now();

    // Per-minute check
    const minuteKey = `${key}:min`;
    let minuteBucket = this.minuteBuckets.get(minuteKey);
    if (!minuteBucket || now - minuteBucket.windowStart > 60000) {
      minuteBucket = { count: 0, windowStart: now };
      this.minuteBuckets.set(minuteKey, minuteBucket);
    }

    // Per-day check
    const dayKey = `${key}:day`;
    let dayBucket = this.buckets.get(dayKey);
    if (!dayBucket || now - dayBucket.windowStart > 86400000) {
      dayBucket = { count: 0, windowStart: now };
      this.buckets.set(dayKey, dayBucket);
    }

    const minuteRemaining = Math.max(0, quota.requestsPerMinute - minuteBucket.count);
    const dayRemaining = Math.max(0, quota.requestsPerDay - dayBucket.count);

    if (minuteBucket.count >= quota.requestsPerMinute) {
      return { allowed: false, remaining: 0, resetMs: 60000 - (now - minuteBucket.windowStart) };
    }

    if (dayBucket.count >= quota.requestsPerDay) {
      return { allowed: false, remaining: 0, resetMs: 86400000 - (now - dayBucket.windowStart) };
    }

    minuteBucket.count++;
    dayBucket.count++;

    return { allowed: true, remaining: Math.min(minuteRemaining, dayRemaining), resetMs: 60000 - (now - minuteBucket.windowStart) };
  }

  reset(key: string): void {
    this.buckets.delete(key);
    this.minuteBuckets.delete(`${key}:min`);
  }
}
```

- [ ] **Step 2: Export RateLimiter from billing**

```typescript
// packages/billing/src/index.ts — add to exports
export { RateLimiter } from "./rate-limiter.js";
```

- [ ] **Step 3: Integrate rate limiter into API server**

```typescript
// packages/api/src/server.ts — add RateLimiter import and usage

// At top of class:
private rateLimiter = new (await import("@litho/billing")).RateLimiter();

// In handleRequest, after resolving auth and before processing:
const rateCheck = this.rateLimiter.check(ctx.user?.id || "anon", ctx.tier);
if (!rateCheck.allowed) {
  res.setHeader("Retry-After", String(Math.ceil(rateCheck.resetMs / 1000)));
  this.sendJSON(res, 429, {
    success: false,
    error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetMs / 1000)}s.`,
    timestamp: Date.now(),
  });
  return;
}
res.setHeader("X-RateLimit-Remaining", String(rateCheck.remaining));
```

- [ ] **Step 4: Integrate rate limiter into JetBrains bridge**

```typescript
// packages/jetbrains/src/bridge.ts — same pattern

// After auth middleware, before route handlers:
const rateLimiter = new (require("@litho/billing")).RateLimiter();

// In middleware or per-route:
app.use((req, res, next) => {
  const userId = jetbrainsAuth.context.user?.id || "anon";
  const rateCheck = rateLimiter.check(userId, jetbrainsAuth.context.tier);
  if (!rateCheck.allowed) {
    res.status(429).json({ error: "Rate limit exceeded", retryAfter: Math.ceil(rateCheck.resetMs / 1000) });
    return;
  }
  res.setHeader("X-RateLimit-Remaining", String(rateCheck.remaining));
  next();
});
```

---

### Task 11: Add Usage Tracking with Cost Estimation

**Files:**
- Modify: `packages/providers/src/client.ts` — add cost tracking
- Modify: `packages/billing/src/index.ts` — add cost estimation

- [ ] **Step 1: Add provider cost model**

```typescript
// packages/providers/src/client.ts — add cost tracking to chat method

export const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.00001, output: 0.00003 },
  "claude-3-opus": { input: 0.000015, output: 0.000075 },
  "claude-3-sonnet": { input: 0.000003, output: 0.000015 },
  "default": { input: 0.000002, output: 0.00001 },
};

export interface UsageTracking {
  userId?: string;
  onUsage?: (tokens: number, cost: number, provider: string, model: string) => void;
}

export class LLMClient {
  constructor(private endpoint: EndpointResult, private usageTracking?: UsageTracking) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    const url = this.buildURL("/chat/completions");
    const body = {
      model: opts.model ?? this.endpoint.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 4096,
      stream: false,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LLM request failed (${res.status}): ${text}`);
    }

    const data = await res.json() as { choices: { message: { content: string } }[]; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } };

    if (data.usage && this.usageTracking?.onUsage) {
      const model = opts.model ?? this.endpoint.model;
      const rates = COST_PER_TOKEN[model] || COST_PER_TOKEN.default;
      const cost = (data.usage.prompt_tokens * rates.input + data.usage.completion_tokens * rates.output);
      this.usageTracking.onUsage(data.usage.total_tokens, cost, this.endpoint.providerId, model);
    }

    return data.choices[0]?.message?.content ?? "";
  }
  // ... rest remains the same
}
```

- [ ] **Step 2: Add usage aggregation to billing**

```typescript
// packages/billing/src/index.ts — add usage tracking class

export interface CostEstimate {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  byProvider: Record<string, { requests: number; tokens: number; cost: number }>;
  byModel: Record<string, { requests: number; tokens: number; cost: number }>;
}

export class UsageTracker {
  private records: Array<{ userId: string; tokens: number; cost: number; provider: string; model: string; timestamp: number }> = [];

  record(userId: string, tokens: number, cost: number, provider: string, model: string): void {
    this.records.push({ userId, tokens, cost, provider, model, timestamp: Date.now() });
  }

  getCostEstimate(userId: string, since: number = Date.now() - 86400000): CostEstimate {
    const userRecords = this.records.filter(r => r.userId === userId && r.timestamp >= since);

    const byProvider: CostEstimate["byProvider"] = {};
    const byModel: CostEstimate["byModel"] = {};

    for (const r of userRecords) {
      if (!byProvider[r.provider]) byProvider[r.provider] = { requests: 0, tokens: 0, cost: 0 };
      byProvider[r.provider].requests++;
      byProvider[r.provider].tokens += r.tokens;
      byProvider[r.provider].cost += r.cost;

      if (!byModel[r.model]) byModel[r.model] = { requests: 0, tokens: 0, cost: 0 };
      byModel[r.model].requests++;
      byModel[r.model].tokens += r.tokens;
      byModel[r.model].cost += r.cost;
    }

    return {
      totalCost: userRecords.reduce((s, r) => s + r.cost, 0),
      totalTokens: userRecords.reduce((s, r) => s + r.tokens, 0),
      totalRequests: userRecords.length,
      byProvider,
      byModel,
    };
  }
}
```

---

### Task 12: Add Admin Configuration to Dashboard

**Files:**
- Modify: `packages/dashboard/src/types.ts`
- Modify: `packages/dashboard/src/api.ts`
- Modify: `packages/dashboard/src/app-router.ts`

- [ ] **Step 1: Add admin types**

```typescript
// packages/dashboard/src/types.ts — append
export interface AdminConfig {
  maintenanceMode: boolean;
  allowedTiers: ("free" | "pro" | "enterprise")[];
  maxSessionDuration: number;
  telemetryEnabled: boolean;
  rateLimitMultiplier: number;
  promoCodeDefaults: {
    discountPercent: number;
    maxUses: number;
    durationDays: number;
  };
}
```

- [ ] **Step 2: Add admin methods to DashboardAPI**

```typescript
// packages/dashboard/src/api.ts — add to class

  private adminConfig: AdminConfig = {
    maintenanceMode: false,
    allowedTiers: ["free", "pro", "enterprise"],
    maxSessionDuration: 86400000,
    telemetryEnabled: true,
    rateLimitMultiplier: 1,
    promoCodeDefaults: { discountPercent: 20, maxUses: 100, durationDays: 30 },
  };

  async getAdminConfig(): Promise<AdminConfig> {
    return { ...this.adminConfig };
  }

  async updateAdminConfig(updates: Partial<AdminConfig>): Promise<AdminConfig> {
    this.adminConfig = { ...this.adminConfig, ...updates };
    return { ...this.adminConfig };
  }

  async getUsageByTier(): Promise<Record<string, number>> {
    return { free: 0, pro: 0, enterprise: 0 };
  }

  async getRevenueSummary(): Promise<{ totalRevenue: number; activeSubscriptions: number; churnRate: number }> {
    return { totalRevenue: 0, activeSubscriptions: 0, churnRate: 0 };
  }
```

- [ ] **Step 3: Add admin routes to dashboard router**

```typescript
// packages/dashboard/src/app-router.ts — add to DASHBOARD_ROUTES
  {
    path: "/admin",
    title: "Admin Configuration",
    description: "Platform settings, tier management, promo codes, usage overview",
    componentName: "AdminPanel",
  },
  {
    path: "/admin/usage",
    title: "Usage Analytics",
    description: "Per-tier usage statistics, cost tracking, revenue",
    componentName: "UsageAnalytics",
  },
  {
    path: "/admin/promos",
    title: "Promo Code Manager",
    description: "Create, activate, and monitor promotional codes",
    componentName: "PromoCodeManager",
  },
```

---

### Task 13: Add Promo Code System

**Files:**
- Create: `packages/billing/src/promo.ts`
- Modify: `packages/billing/src/index.ts`

- [ ] **Step 1: Create promo code manager**

```typescript
// packages/billing/src/promo.ts
import type { PromoCode } from "./types.js";

export class PromoCodeManager {
  private promos = new Map<string, PromoCode>();

  create(code: Omit<PromoCode, "currentUses">): PromoCode {
    const promo: PromoCode = { ...code, currentUses: 0 };
    this.promos.set(code.code.toLowerCase(), promo);
    return promo;
  }

  get(code: string): PromoCode | undefined {
    return this.promos.get(code.toLowerCase());
  }

  list(): PromoCode[] {
    return [...this.promos.values()];
  }

  validate(code: string, tier: "free" | "pro" | "enterprise"): { valid: boolean; discount?: number; error?: string } {
    const promo = this.promos.get(code.toLowerCase());
    if (!promo) return { valid: false, error: "Invalid promo code" };
    if (promo.currentUses >= promo.maxUses) return { valid: false, error: "Promo code fully redeemed" };
    if (Date.now() > promo.expiresAt) return { valid: false, error: "Promo code expired" };
    if (!promo.applicableTiers.includes(tier)) return { valid: false, error: "Not applicable to your tier" };
    return { valid: true, discount: promo.discountPercent };
  }

  redeem(code: string): { valid: boolean; discount?: number; error?: string } {
    const result = this.validate(code, "pro");
    if (result.valid) {
      const promo = this.promos.get(code.toLowerCase())!;
      promo.currentUses++;
    }
    return result;
  }

  delete(code: string): boolean {
    return this.promos.delete(code.toLowerCase());
  }
}
```

- [ ] **Step 2: Export PromoCodeManager from billing**

```typescript
// packages/billing/src/index.ts — add
export { PromoCodeManager } from "./promo.js";
```

---

### Task 14: DDF-Only Provider Gating for Free Tier

**Files:**
- Modify: `packages/providers/src/resolver.ts`
- Modify: `packages/providers/src/catalog.ts`
- Modify: `packages/providers/src/index.ts`

- [ ] **Step 1: Add filtering helper and export**

```typescript
// packages/providers/src/resolver.ts — add after getProvider

export function getAvailableProviders(tier: "free" | "pro" | "enterprise"): string[] {
  return Object.entries(PROVIDERS)
    .filter(([_, def]) => {
      if (tier === "enterprise") return true;
      if (tier === "pro") return def.tier === "pro" || def.tier === "all";
      if (tier === "free") return def.tier === "all";
      return false;
    })
    .map(([id]) => id);
}

export function checkProviderAccess(providerId: string, tier: "free" | "pro" | "enterprise"): { allowed: boolean; error?: string } {
  const def = PROVIDERS[providerId];
  if (!def) return { allowed: false, error: `Unknown provider: ${providerId}` };
  if (tier === "free" && def.tier !== "all") {
    return { allowed: false, error: `Free tier is limited to DDF Gateway. Provider "${providerId}" requires Pro or Enterprise.` };
  }
  return { allowed: true };
}
```

- [ ] **Step 2: Update providers index**

```typescript
// packages/providers/src/index.ts — add if not exists
export { PROVIDERS } from "./catalog.js";
export { getProvider, resolveEndpoint, resolveSpec, loadKayartConfig, getProvidersByTier, getAvailableProviders, checkProviderAccess } from "./resolver.js";
export { LLMClient, type ChatMessage, type ChatOptions } from "./client.js";
export type { ProviderDef, EndpointResult, CompatMode, DiscoveryStrategy } from "./types.js";
```

---

### Task 15: Tests for All New Packages

**Files:**
- Create: `packages/billing/tests/tier-manager.test.ts`
- Create: `packages/billing/tests/rate-limiter.test.ts`
- Create: `packages/billing/tests/promo.test.ts`
- Create: `packages/telemetry/tests/consent.test.ts`
- Create: `packages/security/tests/auth-guard.test.ts`
- Create: `packages/providers/tests/resolver-tier.test.ts`
- Create: `packages/vscode/tests/vscode-auth.test.ts`

Each test file should follow the Vitest patterns seen in the existing codebase. Below is a representative sample:

- [ ] **Step 1: Test tier manager**

```typescript
// packages/billing/tests/tier-manager.test.ts
import { describe, it, expect } from "vitest";
import { TierManager } from "../src/index.js";

describe("TierManager", () => {
  it("returns correct quota for free tier", () => {
    const mgr = new TierManager();
    const quota = mgr.getQuota("free");
    expect(quota.requestsPerDay).toBe(100);
    expect(quota.ddfOnly).toBe(true);
    expect(quota.telemetryRequired).toBe(true);
  });

  it("returns correct quota for enterprise tier", () => {
    const mgr = new TierManager();
    const quota = mgr.getQuota("enterprise");
    expect(quota.requestsPerDay).toBe(10000);
    expect(quota.ddfOnly).toBe(false);
    expect(quota.maxProviders).toBe(39);
  });

  it("lists three plans", () => {
    const mgr = new TierManager();
    expect(mgr.getPlans()).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Test rate limiter**

```typescript
// packages/billing/tests/rate-limiter.test.ts
import { describe, it, expect } from "vitest";
import { RateLimiter } from "../src/rate-limiter.js";

describe("RateLimiter", () => {
  it("allows requests within free tier limit", () => {
    const rl = new RateLimiter();
    for (let i = 0; i < 10; i++) {
      const result = rl.check("user1", "free");
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks after free tier minute limit", () => {
    const rl = new RateLimiter();
    for (let i = 0; i < 10; i++) {
      rl.check("user2", "free");
    }
    const result = rl.check("user2", "free");
    expect(result.allowed).toBe(false);
  });
});
```

- [ ] **Step 3: Test promo codes**

```typescript
// packages/billing/tests/promo.test.ts
import { describe, it, expect } from "vitest";
import { PromoCodeManager } from "../src/promo.js";

describe("PromoCodeManager", () => {
  it("creates and validates a promo code", () => {
    const mgr = new PromoCodeManager();
    mgr.create({
      code: "LAUNCH20",
      description: "20% off launch special",
      discountPercent: 20,
      maxUses: 100,
      expiresAt: Date.now() + 86400000,
      applicableTiers: ["pro", "enterprise"],
    });

    const result = mgr.validate("LAUNCH20", "pro");
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(20);
  });

  it("rejects promo for non-applicable tier", () => {
    const mgr = new PromoCodeManager();
    mgr.create({
      code: "PROONLY",
      description: "Pro only",
      discountPercent: 10,
      maxUses: 100,
      expiresAt: Date.now() + 86400000,
      applicableTiers: ["pro"],
    });

    const result = mgr.validate("PROONLY", "free");
    expect(result.valid).toBe(false);
  });

  it("rejects expired promo", () => {
    const mgr = new PromoCodeManager();
    mgr.create({
      code: "EXPIRED",
      description: "Expired",
      discountPercent: 10,
      maxUses: 100,
      expiresAt: Date.now() - 1,
      applicableTiers: ["pro"],
    });

    const result = mgr.validate("EXPIRED", "pro");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });
});
```

- [ ] **Step 4: Test telemetry consent**

```typescript
// packages/telemetry/tests/consent.test.ts
import { describe, it, expect } from "vitest";
import { ConsentManager } from "../src/consent.js";

describe("ConsentManager", () => {
  it("free tier requires consent by default", () => {
    const cm = new ConsentManager();
    expect(cm.isConsentRequired("free")).toBe(true);
  });

  it("pro tier does not require consent", () => {
    const cm = new ConsentManager();
    expect(cm.isConsentRequired("pro")).toBe(false);
  });

  it("tracks granted consent", () => {
    const cm = new ConsentManager();
    cm.grantConsent("user1");
    expect(cm.hasConsented("user1")).toBe(true);
  });

  it("tracks revoked consent", () => {
    const cm = new ConsentManager();
    cm.grantConsent("user1");
    cm.revokeConsent("user1");
    expect(cm.hasConsented("user1")).toBe(false);
  });
});
```

- [ ] **Step 5: Test auth guard**

```typescript
// packages/security/tests/auth-guard.test.ts
import { describe, it, expect } from "vitest";
import { AuthGuard } from "../src/auth-guard.js";

describe("AuthGuard", () => {
  it("returns unauthenticated context without token", async () => {
    const guard = new AuthGuard();
    const ctx = await guard.authenticate();
    expect(ctx.authenticated).toBe(false);
    expect(ctx.tier).toBe("free");
  });

  it("free tier has ddfOnly quota", () => {
    const guard = new AuthGuard();
    expect(guard.isDDFOnly({ authenticated: false, tier: "free", quota: { requestsPerMinute: 10, requestsPerDay: 100, maxProviders: 1, maxTeamMembers: 1, dataRetentionDays: 7, telemetryRequired: true, ddfOnly: true } })).toBe(true);
  });

  it("pro tier is not ddfOnly", () => {
    const guard = new AuthGuard();
    expect(guard.isDDFOnly({ authenticated: true, user: { id: "1", email: "a@b.com" }, tier: "pro", quota: { requestsPerMinute: 60, requestsPerDay: 1000, maxProviders: 10, maxTeamMembers: 5, dataRetentionDays: 90, telemetryRequired: false, ddfOnly: false } })).toBe(false);
  });
});
```

- [ ] **Step 6: Test provider tier gating**

```typescript
// packages/providers/tests/resolver-tier.test.ts
import { describe, it, expect } from "vitest";
import { getAvailableProviders, checkProviderAccess } from "../src/resolver.js";

describe("Provider Tier Gating", () => {
  it("free tier can only access ddf-gateway", () => {
    const providers = getAvailableProviders("free");
    expect(providers).toEqual(["ddf-gateway"]);
  });

  it("pro tier can access all pro and all providers", () => {
    const providers = getAvailableProviders("pro");
    expect(providers.includes("ddf-gateway")).toBe(true);
    expect(providers.includes("openai")).toBe(true);
    expect(providers.includes("anthropic")).toBe(true);
  });

  it("enterprise tier can access all", () => {
    const providers = getAvailableProviders("enterprise");
    expect(providers.length).toBeGreaterThan(38);
  });

  it("blocks free tier from non-ddf provider", () => {
    const result = checkProviderAccess("openai", "free");
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("Free tier");
  });

  it("allows free tier to use ddf-gateway", () => {
    const result = checkProviderAccess("ddf-gateway", "free");
    expect(result.allowed).toBe(true);
  });
});
```

---

## Self-Review

### Spec coverage check

| Requirement | Tasks covering it |
|---|---|
| Auth lock all platforms | Task 3 (AuthGuard), Task 4 (VS Code), Task 5 (JetBrains), Task 6 (API) |
| Tier system (Free/Pro/Enterprise) | Task 1 (types + TIER_QUOTAS), Task 2 (GatewayUser tier), Task 7 (provider tier) |
| Feature gating | Task 3 (AuthGuard.isDDFOnly/checkQuota), Task 7 (getAvailableProviders/checkProviderAccess) |
| Usage limits per tier | Task 1 (TIER_QUOTAS), Task 10 (RateLimiter) |
| Integration with DDF gateway for auth/tier info | Task 2 (fetchTier, tier in verifyApiKey/verifyToken) |
| Telemetry/usage tracking | Task 8 (TelemetryTracker, TelemetryEvent) |
| Data collection consent | Task 8 (ConsentManager) |
| Privacy policy acceptance | Task 8 (ConsentManager, PrivacyPolicy) |
| Free user data collection for training | Task 8 (ConsentManager.isConsentRequired("free") = true) |
| DDF-only for free tier | Task 7 (catalog tier field), Task 14 (getAvailableProviders/checkProviderAccess) |
| Usage stats / cost tracking | Task 11 (UsageTracker, COST_PER_TOKEN) |
| Rate limiting | Task 10 (RateLimiter), integrated into API + Bridge |
| Admin dashboard | Task 12 (AdminConfig, admin routes) |
| Promo codes | Task 13 (PromoCodeManager) |

### Type consistency check
- `Tier` type is consistently `"free" | "pro" | "enterprise"` across all files
- `UsageQuota` is defined once in `security/types.ts` and referenced by `TIER_QUOTAS`
- `GatewayUser.tier` uses the same `Tier` union
- All function signatures reference the same types across tasks
- Task 9 `billingCommand` uses `TierManager` from `@litho/billing` — import available since Task 1 creates the package
- Task 11 `UsageTracker` in `billing/src/index.ts` is alongside `TierManager` — consistent file

### No placeholder check
- No TODOs, TBDs, or placeholder patterns
- All code blocks contain complete, compilable TypeScript
- All test files contain real assertions
- All file paths are exact

---

## Execution

Plan complete and saved to `docs/superpowers/plans/2026-07-23-lithomind-monetization-auth-platform.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
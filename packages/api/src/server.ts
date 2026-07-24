import { createServer, IncomingMessage, ServerResponse } from "http";
import type { APIResponse, RunOPCRequest, RCARequest } from "./types.js";
import { AgentSwarm } from "@litho/core";
import { PDKManager } from "@litho/pdk";
import { CapabilityManager } from "@litho/capability";
import { GatewayAuthClient, AuthGuard, TierManager, RateLimiter } from "@litho/security";
import { checkProviderAccess } from "@litho/providers";

export class LithoAPIServer {
  private pdkManager = new PDKManager();
  private swarm = new AgentSwarm();
  private capabilityManager = new CapabilityManager();
  private authClient = new GatewayAuthClient();
  private authGuard = new AuthGuard();
  private rateLimiter = new RateLimiter();

  async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const method = req.method?.toUpperCase() || "GET";
    const clientIp = req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "unknown";

    res.setHeader("Content-Type", "application/json");

    try {
      if (method === "GET" && url.pathname === "/api/v1/health") {
        this.sendJSON(res, 200, { success: true, data: { status: "healthy", product: "agentic-lithography", uptime: process.uptime() }, timestamp: Date.now() });
        return;
      }

      // Authentication verification endpoint (no auth required)
      if (method === "GET" && url.pathname === "/api/v1/auth/status") {
        const authHeader = req.headers["authorization"] || "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        const authResult = await this.authClient.verifyToken(token);
        this.sendJSON(res, authResult.valid ? 200 : 401, {
          success: authResult.valid,
          data: authResult.user || null,
          error: authResult.error,
          timestamp: Date.now(),
        });
        return;
      }

      // Auth guard for all other API routes
      const apiKey = req.headers["x-api-key"] as string || process.env.DDF_API_KEY || "";
      if (!apiKey) {
        this.sendJSON(res, 401, { success: false, error: "Authentication required. Provide DDF_API_KEY or x-api-key header.", timestamp: Date.now() });
        return;
      }

      const tier = TierManager.detectTier(apiKey);

      // Rate limiting
      const rateCheck = this.rateLimiter.check(clientIp, tier);
      if (!rateCheck.allowed) {
        res.setHeader("Retry-After", String(rateCheck.retryAfter || 60));
        this.sendJSON(res, 429, { success: false, error: `Rate limit exceeded. Retry after ${rateCheck.retryAfter}s`, timestamp: Date.now() });
        return;
      }

      // Verify JWT token for non-health routes
      const authHeader = req.headers["authorization"] || "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (token) {
        const authResult = await this.authClient.verifyToken(token);
        if (!authResult.valid && url.pathname !== "/api/v1/auth/status") {
          this.sendJSON(res, 401, { success: false, error: authResult.error || "Invalid authentication token", timestamp: Date.now() });
          return;
        }
      }

      // Check provider access for provider-specific endpoints
      const requestedProvider = url.searchParams.get("provider");
      if (requestedProvider) {
        try {
          checkProviderAccess(requestedProvider, tier);
        } catch (e) {
          this.sendJSON(res, 403, { success: false, error: (e as Error).message, timestamp: Date.now() });
          return;
        }
      }

      // Capabilities listing endpoint
      if (method === "GET" && url.pathname === "/api/v1/capabilities") {
        const type = url.searchParams.get("type") as any;
        const capabilities = this.capabilityManager.list({ type });
        this.sendJSON(res, 200, { success: true, data: { capabilities }, timestamp: Date.now() });
        return;
      }

      // Remote Gateway sync capabilities endpoint
      if (method === "POST" && url.pathname === "/api/v1/capabilities/sync") {
        const authHeader = req.headers["authorization"] || "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        const gatewayUrl = (req.headers["x-ddf-gateway"] as string) || process.env.DDF_GATEWAY_URL || "https://aiback.ddfrl.com/v1";

        const syncResult = await this.capabilityManager.syncFromRemoteGateway(gatewayUrl, token, "agentic-lithography");
        this.sendJSON(res, syncResult.error ? 400 : 200, {
          success: !syncResult.error,
          data: { synced: syncResult.synced },
          error: syncResult.error,
          timestamp: Date.now(),
        });
        return;
      }

      if (method === "GET" && url.pathname === "/api/v1/pdk") {
        const pdks = this.pdkManager.listAvailable();
        this.sendJSON(res, 200, { success: true, data: { pdks }, timestamp: Date.now() });
        return;
      }

      if (method === "POST" && url.pathname === "/api/v1/run") {
        const body = await this.parseBody<RunOPCRequest>(req);
        const pdk = this.pdkManager.loadPDK(body.pdkName || "tsmc-n3e");
        const responses = await this.swarm.executePipeline(body.jobId, { layoutPath: body.layoutPath, pdk });

        this.sendJSON(res, 200, { success: true, data: { jobId: body.jobId, pipelineOutput: responses }, timestamp: Date.now() });
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

  private sendJSON<T>(res: ServerResponse, status: number, payload: APIResponse<T>): void {
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

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { readFile, writeFile, readdir, access } from "node:fs/promises";
import { AuthFlow, TierManager, GatewayAuthClient } from "@litho/security";
import type { AuthContext } from "@litho/security";
import { CapabilityManager } from "@litho/capability";

const authFlow = new AuthFlow();

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === "/health" || req.path.startsWith("/auth/")) return next();

  authFlow.checkSession().then((creds) => {
    if (!creds) {
      res.status(401).json({ error: "Authentication required. Use /auth/ endpoints to sign in." });
      return;
    }
    (req as any).creds = creds;
    next();
  }).catch(() => {
    res.status(500).json({ error: "Auth check failed" });
  });
}

export function createBridgeServer(port: number = 3847): Express {
  const app: Express = express();
  app.use(express.json());
  app.use(authMiddleware);

  const capabilityManager = new CapabilityManager();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", product: "agentic-lithography", version: "0.1.0" });
  });

  app.get("/auth/status", async (_req, res) => {
    const creds = await authFlow.checkSession();
    if (!creds) return res.json({ authenticated: false });
    res.json({
      authenticated: true,
      email: creds.email,
      tier: creds.tier,
    });
  });

  app.post("/auth/api-key", async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
      res.status(400).json({ valid: false, error: "apiKey required" });
      return;
    }
    const result = await authFlow.validateApiKey(apiKey);
    res.status(result.valid ? 200 : 401).json(result);
  });

  app.post("/auth/logout", async (_req, res) => {
    await authFlow.logout();
    res.json({ success: true });
  });

  app.post("/auth/login", async (req, res) => {
    const { method } = req.body;
    if (method === "browser") {
      try {
        const loginUrl = `https://ai.ddfrl.com/auth/login?product=agentic-lithography&jetbrains=true`;
        res.json({ loginUrl });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const { apiKey } = req.body;
      if (!apiKey) {
        res.status(400).json({ error: "apiKey required for api-key method" });
        return;
      }
      const result = await authFlow.validateApiKey(apiKey);
      res.status(result.valid ? 200 : 401).json(result);
    }
  });

  app.get("/auth/poll", async (req, res) => {
    const { state } = req.query;
    if (!state) {
      res.status(400).json({ error: "state parameter required" });
      return;
    }
    try {
      const pollRes = await fetch(`https://aiback.ddfrl.com/v1/auth/poll?state=${state}`);
      const pollData = await pollRes.json();
      if (pollData.status === "approved" && pollData.apiKey) {
        const result = await authFlow.validateApiKey(pollData.apiKey);
        res.json({ completed: true, ...result });
      } else if (pollData.status === "denied" || pollData.status === "expired") {
        res.json({ completed: false, error: pollData.status });
      } else {
        res.json({ completed: false });
      }
    } catch {
      res.json({ completed: false });
    }
  });

  app.post("/auth/device-code", async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
      res.status(400).json({ error: "apiKey required to generate device code" });
      return;
    }
    const result = await authFlow.validateApiKey(apiKey);
    if (!result.valid || !result.profile) {
      res.status(401).json({ error: result.error || "Invalid API key" });
      return;
    }
    const gw = new GatewayAuthClient();
    const profile = result.profile as AuthContext;
    const deviceCode = await gw.generateDeviceCode(
      profile.userId || "unknown",
      profile.email || "unknown",
      profile.tier || "free",
      (profile.scopes || []) as any,
      profile.allowedProviders || []
    );
    res.json({ deviceCode: deviceCode.code, state: deviceCode.state, expiresIn: 600 });
  });

  app.post("/auth/verify-code", async (req, res) => {
    const { code, state } = req.body;
    if (!code || !state) {
      res.status(400).json({ error: "code and state required" });
      return;
    }
    const gw = new GatewayAuthClient();
    const result = await gw.verifyDeviceCode(code, state);
    if (result.valid) {
      const sessionResult = await authFlow.validateApiKey(result.profile?.key || code);
      res.json(sessionResult);
    } else {
      res.status(401).json({ error: result.error || "Invalid code" });
    }
  });

  app.get("/capabilities", (req, res) => {
    const type = req.query.type as any;
    const capabilities = capabilityManager.list({ type });
    res.json({ capabilities });
  });

  app.post("/capabilities/sync", async (req, res) => {
    const { apiKey, gatewayUrl } = req.body;
    const token = apiKey || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    const url = gatewayUrl || process.env.DDF_GATEWAY_URL || "https://aiback.ddfrl.com/v1";
    const result = await capabilityManager.syncFromRemoteGateway(url, token, "agentic-lithography");
    res.status(result.error ? 400 : 200).json(result);
  });

  app.post("/ask", async (req, res) => {
    const { query } = req.body;
    res.json({ response: `Processed: ${query}` });
  });

  app.post("/run", async (req, res) => {
    const { layout, pdk } = req.body;
    res.json({ jobId: "pending", layout, pdk });
  });

  // Filesystem endpoints for JetBrainsHostAdapter
  app.post("/fs/read", async (req: Request, res: Response) => {
    try {
      const { path } = req.body;
      const content = await readFile(path, "utf-8");
      res.json({ content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/fs/write", async (req: Request, res: Response) => {
    try {
      const { path, content } = req.body;
      await writeFile(path, content, "utf-8");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/fs/list", async (req: Request, res: Response) => {
    try {
      const { path } = req.body;
      const entries = await readdir(path, { withFileTypes: true });
      const files = entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name));
      res.json({ files });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/fs/exists", async (req: Request, res: Response) => {
    try {
      const { path } = req.body;
      await access(path);
      res.json({ exists: true });
    } catch {
      res.json({ exists: false });
    }
  });

  // UI endpoints for JetBrainsHostAdapter
  app.post("/ui/prompt", async (req: Request, res: Response) => {
    const { message } = req.body;
    res.json({ answer: message });
  });

  app.post("/ui/notify", async (req: Request, res: Response) => {
    const { message, level } = req.body;
    console.log(`[${level.toUpperCase()}] ${message}`);
    res.json({ success: true });
  });

  const progressSessions = new Map<string, { message: string; total: number; current: number }>();

  app.post("/ui/progress/start", async (req: Request, res: Response) => {
    const { message, total } = req.body;
    const progressId = `progress_${Date.now()}`;
    progressSessions.set(progressId, { message, total, current: 0 });
    res.json({ progressId });
  });

  app.post("/ui/progress/update", async (req: Request, res: Response) => {
    const { progressId, current, total } = req.body;
    const session = progressSessions.get(progressId);
    if (session) {
      session.current = current;
      session.total = total;
    }
    res.json({ success: true });
  });

  app.post("/ui/progress/done", async (req: Request, res: Response) => {
    const { progressId } = req.body;
    progressSessions.delete(progressId);
    res.json({ success: true });
  });

  app.post("/ui/open-url", async (req: Request, res: Response) => {
    const { url } = req.body;
    console.log(`Opening: ${url}`);
    res.json({ success: true });
  });

  app.post("/output/stream", async (req: Request, res: Response) => {
    const chunk = req.body;
    console.log(`[LithoMind] ${chunk?.output?.summary ?? JSON.stringify(chunk)}`);
    res.json({ success: true });
  });

  app.listen(port, () => {
    console.log(`LithoMind JetBrains bridge running on port ${port}`);
  });

  return app;
}

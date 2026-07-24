import express from "express";
import { AuthFlow } from "@litho/security";
import { CapabilityManager } from "@litho/capability";
const authFlow = new AuthFlow();
function authMiddleware(req, res, next) {
    if (req.path === "/health" || req.path.startsWith("/auth/"))
        return next();
    authFlow.checkSession().then((creds) => {
        if (!creds) {
            res.status(401).json({ error: "Authentication required. Use /auth/ endpoints to sign in." });
            return;
        }
        req.creds = creds;
        next();
    }).catch(() => {
        res.status(500).json({ error: "Auth check failed" });
    });
}
export function createBridgeServer(port = 3847) {
    const app = express();
    app.use(express.json());
    app.use(authMiddleware);
    const capabilityManager = new CapabilityManager();
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", product: "agentic-lithography", version: "0.1.0" });
    });
    app.get("/auth/status", async (_req, res) => {
        const creds = await authFlow.checkSession();
        if (!creds)
            return res.json({ authenticated: false });
        res.json({
            authenticated: true,
            email: creds.email,
            name: creds.name,
            tier: creds.tier,
            limits: creds.limits,
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
            }
            catch (err) {
                res.status(500).json({ error: err.message });
            }
        }
        else {
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
            if (pollData.completed && pollData.apiKey) {
                const result = await authFlow.validateApiKey(pollData.apiKey);
                res.json({ completed: true, ...result });
            }
            else {
                res.json({ completed: false });
            }
        }
        catch {
            res.json({ completed: false });
        }
    });
    app.get("/capabilities", (req, res) => {
        const type = req.query.type;
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
    app.listen(port, () => {
        console.log(`LithoMind JetBrains bridge running on port ${port}`);
    });
    return app;
}
//# sourceMappingURL=bridge.js.map
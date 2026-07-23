import express from "express";
import { CapabilityManager } from "@litho/capability";
import { GatewayAuthClient } from "@litho/security";
export function createBridgeServer(port = 3847) {
    const app = express();
    app.use(express.json());
    const capabilityManager = new CapabilityManager();
    const authClient = new GatewayAuthClient();
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
        res.status(result.valid ? 200 : 401).json(result);
    });
    app.get("/capabilities", (req, res) => {
        const type = req.query.type;
        const capabilities = capabilityManager.list({ type });
        res.json({ capabilities });
    });
    app.post("/capabilities/sync", async (req, res) => {
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
        res.json({ jobId: "pending", layout, pdk });
    });
    app.listen(port, () => {
        console.log(`LithoMind JetBrains bridge running on port ${port}`);
    });
    return app;
}
//# sourceMappingURL=bridge.js.map
import express, { type Express } from "express";

export function createBridgeServer(port: number = 3847): Express {
  const app: Express = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: "0.1.0" });
  });

  app.post("/ask", async (req, res) => {
    const { query } = req.body;
    // In production: route through NLI
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

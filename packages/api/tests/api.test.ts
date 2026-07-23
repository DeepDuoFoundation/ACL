import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { LithoAPIServer } from "../src/server.js";
import { LithoGRPCService } from "../src/grpc.js";
import type { Server } from "http";
import type { AddressInfo } from "net";

describe("API Package (@litho/api)", () => {
  let server: Server;
  let baseURL: string;

  beforeAll(async () => {
    const apiServer = new LithoAPIServer();
    server = apiServer.createHTTPServer();

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as AddressInfo;
        baseURL = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("handles /api/v1/health GET request", async () => {
    const res = await fetch(`${baseURL}/api/v1/health`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("healthy");
  });

  it("handles /api/v1/pdk GET request", async () => {
    const res = await fetch(`${baseURL}/api/v1/pdk`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.pdks).toContain("TSMC N3E");
  });

  it("handles /api/v1/run POST request", async () => {
    const res = await fetch(`${baseURL}/api/v1/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "job-100", pdkName: "tsmc-n3e" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.jobId).toBe("job-100");
    expect(body.data.pipelineOutput).toBeDefined();
  });

  it("exports gRPC service definitions", () => {
    expect(LithoGRPCService.serviceName).toBe("lithomind.v1.AgentService");
    expect(LithoGRPCService.methods).toHaveLength(3);
  });
});

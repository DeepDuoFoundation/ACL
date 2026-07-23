import { describe, it, expect } from "vitest";
import { CalibreConnector } from "../src/calibre.js";
import { ProteusConnector } from "../src/proteus.js";
import { ASMLConnector } from "../src/asml.js";
import { EDAConnectorRegistry } from "../src/registry.js";
import type { EDAConfig, EDATask } from "../src/types.js";

const testConfig: EDAConfig = {
  name: "test",
  vendor: "test",
  version: "1.0",
  timeoutMs: 30000,
};

const testTask: EDATask = {
  id: "task-1",
  type: "drc",
  inputFiles: ["/test/input.gds"],
  outputDir: "/test/output",
  parameters: { minSpacing: 21 },
};

describe("CalibreConnector", () => {
  it("should connect and execute DRC task", async () => {
    const connector = new CalibreConnector(testConfig);
    const connected = await connector.connect();
    expect(connected).toBe(true);

    const result = await connector.execute(testTask);
    expect(result.status).toBe("success");
    expect(result.metrics.totalDRCErrors).toBe(0);
  });

  it("should report status", async () => {
    const connector = new CalibreConnector(testConfig);
    await connector.connect();
    const status = await connector.getStatus();
    expect(status.connected).toBe(true);
    expect(status.licenseValid).toBe(true);
  });
});

describe("ProteusConnector", () => {
  it("should connect and execute OPC task", async () => {
    const connector = new ProteusConnector(testConfig);
    await connector.connect();

    const opcTask: EDATask = { ...testTask, type: "opc" };
    const result = await connector.execute(opcTask);
    expect(result.status).toBe("success");
    expect(result.metrics.opcCorrections).toBeGreaterThan(0);
  });
});

describe("ASMLConnector", () => {
  it("should connect and execute simulation task", async () => {
    const connector = new ASMLConnector(testConfig);
    await connector.connect();

    const simTask: EDATask = { ...testTask, type: "simulation" };
    const result = await connector.execute(simTask);
    expect(result.status).toBe("success");
    expect(result.metrics.aerialImageFidelity).toBeGreaterThan(0.9);
  });
});

describe("EDAConnectorRegistry", () => {
  it("should register and list connectors", () => {
    const registry = new EDAConnectorRegistry();
    registry.register(new CalibreConnector(testConfig));
    registry.register(new ProteusConnector(testConfig));

    const list = registry.list();
    expect(list).toContain("Calibre");
    expect(list).toContain("Proteus");
  });

  it("should connect all connectors", async () => {
    const registry = new EDAConnectorRegistry();
    registry.register(new CalibreConnector(testConfig));
    registry.register(new ProteusConnector(testConfig));

    await registry.connectAll();
    const calibre = registry.get("Calibre")!;
    const status = await calibre.getStatus();
    expect(status.connected).toBe(true);
  });

  it("should execute with best connector", async () => {
    const registry = new EDAConnectorRegistry();
    registry.register(new CalibreConnector(testConfig));
    await registry.connectAll();

    const result = await registry.executeWithBestConnector(testTask);
    expect(result.status).toBe("success");
  });
});

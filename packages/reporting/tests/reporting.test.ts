import { describe, it, expect } from "vitest";
import { ReportGenerator } from "../src/generator.js";
import { ReportTemplates } from "../src/templates.js";
import { WhiteLabelRenderer } from "../src/whitelabel.js";
import type { ReportConfig, ReportData, ReportType } from "../src/types.js";

const testConfig: ReportConfig = {
  type: "job_summary",
  format: "pdf",
  includeCharts: true,
  includeRawData: false,
};

const testData: ReportData = {
  jobId: "job-123",
  designId: "design-sram",
  pdk: "TSMC N3E",
  layer: "M1",
  yieldPrediction: 0.95,
  metrics: { epeRms: 0.85, runtime: 120 },
  timestamp: Date.now(),
};

describe("ReportTemplates", () => {
  it("should return template for job summary", () => {
    const templates = new ReportTemplates();
    const sections = templates.getTemplate("job_summary");
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].title).toBe("Executive Summary");
  });

  it("should return template for tapeout readiness", () => {
    const templates = new ReportTemplates();
    const sections = templates.getTemplate("tapeout_readiness");
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].title).toBe("DFM Scorecard");
  });

  it("should return template for RCA investigation", () => {
    const templates = new ReportTemplates();
    const sections = templates.getTemplate("rca_investigation");
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].title).toBe("Symptom Summary");
  });

  it("should return template for all report types", () => {
    const templates = new ReportTemplates();
    const types: ReportType[] = ["job_summary", "tapeout_readiness", "run_comparison", "yield_prediction", "rca_investigation", "team_progress", "customer_deliverable"];

    for (const type of types) {
      const sections = templates.getTemplate(type);
      expect(sections.length).toBeGreaterThan(0);
    }
  });
});

describe("ReportGenerator", () => {
  it("should generate job summary report", async () => {
    const generator = new ReportGenerator();
    const report = await generator.generate(testConfig, testData);

    expect(report.id).toBeDefined();
    expect(report.type).toBe("job_summary");
    expect(report.title).toBe("Job Summary Report");
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it("should generate tapeout readiness report", async () => {
    const generator = new ReportGenerator();
    const config: ReportConfig = { ...testConfig, type: "tapeout_readiness" };
    const report = await generator.generate(config, testData);

    expect(report.type).toBe("tapeout_readiness");
    expect(report.sections[0].title).toBe("DFM Scorecard");
  });

  it("should populate content with data", async () => {
    const generator = new ReportGenerator();
    const report = await generator.generate(testConfig, testData);

    const executiveSummary = report.sections[0].content;
    expect(executiveSummary).toContain("job-123");
    expect(executiveSummary).toContain("TSMC N3E");
    expect(executiveSummary).toContain("95.0%");
  });

  it("should populate tables with metrics", async () => {
    const generator = new ReportGenerator();
    const config: ReportConfig = { ...testConfig, type: "tapeout_readiness" };
    const report = await generator.generate(config, testData);

    const dfmSection = report.sections[0];
    expect(dfmSection.tables).toBeDefined();
    expect(dfmSection.tables!.length).toBeGreaterThan(0);
  });

  it("should generate PDF", async () => {
    const generator = new ReportGenerator();
    const report = await generator.generate(testConfig, testData);
    const pdf = await generator.generatePDF(report);

    expect(pdf).toBeInstanceOf(Buffer);
  });

  it("should generate HTML", async () => {
    const generator = new ReportGenerator();
    const report = await generator.generate(testConfig, testData);
    const html = await generator.generateHTML(report);

    expect(html).toContain("<html>");
    expect(html).toContain("Job Summary Report");
  });
});

describe("WhiteLabelRenderer", () => {
  it("should render header with company name and title", () => {
    const renderer = new WhiteLabelRenderer({ companyName: "Acme Litho" });
    const html = renderer.renderHeader("Test Report");
    expect(html).toContain("Acme Litho");
    expect(html).toContain("Test Report");
    expect(html).toContain("h1");
  });

  it("should render header with logo when provided", () => {
    const renderer = new WhiteLabelRenderer({ logo: "https://example.com/logo.png" });
    const html = renderer.renderHeader("Report");
    expect(html).toContain('<img src="https://example.com/logo.png"');
    expect(html).toContain("Logo");
  });

  it("should render footer with configurable text", () => {
    const renderer = new WhiteLabelRenderer({ footerText: "Confidential - Do Not Distribute" });
    const html = renderer.renderFooter();
    expect(html).toContain("Confidential - Do Not Distribute");
    expect(html).toContain("border-top");
  });

  it("should render table with headers and rows", () => {
    const renderer = new WhiteLabelRenderer();
    const html = renderer.renderTable(["Metric", "Value"], [["EPE RMS", "0.85 nm"], ["DFM Score", "92"]]);
    expect(html).toContain("Metric");
    expect(html).toContain("Value");
    expect(html).toContain("EPE RMS");
    expect(html).toContain("0.85 nm");
    expect(html).toContain("<table");
  });

  it("should render full report with all sections", () => {
    const renderer = new WhiteLabelRenderer({ companyName: "LithoMind Corp" });
    const html = renderer.renderFullReport("Quarterly DFM Report", [
      { title: "Overview", content: "<p>All good</p>" },
      { title: "Metrics", content: "<p>DFM: 95%</p>" },
    ]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Quarterly DFM Report");
    expect(html).toContain("LithoMind Corp");
    expect(html).toContain("Overview");
    expect(html).toContain("Metrics");
    expect(html).toContain("All good");
    expect(html).toContain("DFM: 95%");
  });
});

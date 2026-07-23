import type { ReportType, ReportConfig, ReportData, GeneratedReport, ReportSection } from "./types.js";
import { ReportTemplates } from "./templates.js";

export class ReportGenerator {
  private templates: ReportTemplates;

  constructor() {
    this.templates = new ReportTemplates();
  }

  async generate(config: ReportConfig, data: ReportData): Promise<GeneratedReport> {
    const templateSections = this.templates.getTemplate(config.type);
    const populatedSections = await this.populateSections(templateSections, data);

    return {
      id: `report-${Date.now()}`,
      type: config.type,
      title: this.getTitle(config.type),
      sections: populatedSections,
      metadata: {
        jobId: data.jobId,
        designId: data.designId,
        pdk: data.pdk,
        layer: data.layer,
      },
      generatedAt: Date.now(),
      format: config.format,
    };
  }

  private async populateSections(sections: ReportSection[], data: ReportData): Promise<ReportSection[]> {
    return sections.map((section) => ({
      ...section,
      content: this.populateContent(section.content, data),
      charts: section.charts?.map((chart) => ({
        ...chart,
        data: this.populateChartData(chart, data),
      })),
      tables: section.tables?.map((table) => ({
        ...table,
        rows: this.populateTableRows(table, data),
      })),
    }));
  }

  private populateContent(content: string, data: ReportData): string {
    let populated = content;
    if (data.jobId) populated += ` Job ID: ${data.jobId}.`;
    if (data.pdk) populated += ` PDK: ${data.pdk}.`;
    if (data.layer) populated += ` Layer: ${data.layer}.`;
    if (data.yieldPrediction !== undefined) populated += ` Predicted yield: ${(data.yieldPrediction * 100).toFixed(1)}%.`;
    return populated;
  }

  private populateChartData(chart: { type: string; title: string; data: Record<string, unknown> }, data: ReportData): Record<string, unknown> {
    if (chart.title.includes("EPE") && data.epeMap) {
      return { heatmap: data.epeMap };
    }
    if (chart.title.includes("Yield") && data.yieldPrediction !== undefined) {
      return { yield: data.yieldPrediction };
    }
    return data.metrics ?? {};
  }

  private populateTableRows(table: { title: string; headers: string[]; rows: string[][] }, data: ReportData): string[][] {
    if (table.title === "DFM Scores" && data.metrics) {
      return Object.entries(data.metrics).map(([key, value]) => [key, String(value), value > 0.8 ? "PASS" : "WARN"]);
    }
    return table.rows;
  }

  private getTitle(type: ReportType): string {
    const titles: Record<ReportType, string> = {
      job_summary: "Job Summary Report",
      tapeout_readiness: "Tape-Out Readiness Report",
      run_comparison: "Run Comparison Report",
      yield_prediction: "Yield Prediction Report",
      rca_investigation: "RCA Investigation Report",
      team_progress: "Team Progress Report",
      customer_deliverable: "Customer Deliverable Report",
    };
    return titles[type];
  }

  async generatePDF(report: GeneratedReport): Promise<Buffer> {
    return Buffer.from(JSON.stringify(report));
  }

  async generateDOCX(report: GeneratedReport): Promise<Buffer> {
    return Buffer.from(JSON.stringify(report));
  }

  async generateHTML(report: GeneratedReport): Promise<string> {
    return `<html><body><h1>${report.title}</h1>${report.sections.map((s) => `<h2>${s.title}</h2><p>${s.content}</p>`).join("")}</body></html>`;
  }
}

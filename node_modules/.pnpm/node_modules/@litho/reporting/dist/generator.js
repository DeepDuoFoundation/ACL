import { ReportTemplates } from "./templates.js";
export class ReportGenerator {
    templates;
    constructor() {
        this.templates = new ReportTemplates();
    }
    async generate(config, data) {
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
    async populateSections(sections, data) {
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
    populateContent(content, data) {
        let populated = content;
        if (data.jobId)
            populated += ` Job ID: ${data.jobId}.`;
        if (data.pdk)
            populated += ` PDK: ${data.pdk}.`;
        if (data.layer)
            populated += ` Layer: ${data.layer}.`;
        if (data.yieldPrediction !== undefined)
            populated += ` Predicted yield: ${(data.yieldPrediction * 100).toFixed(1)}%.`;
        return populated;
    }
    populateChartData(chart, data) {
        if (chart.title.includes("EPE") && data.epeMap) {
            return { heatmap: data.epeMap };
        }
        if (chart.title.includes("Yield") && data.yieldPrediction !== undefined) {
            return { yield: data.yieldPrediction };
        }
        return data.metrics ?? {};
    }
    populateTableRows(table, data) {
        if (table.title === "DFM Scores" && data.metrics) {
            return Object.entries(data.metrics).map(([key, value]) => [key, String(value), value > 0.8 ? "PASS" : "WARN"]);
        }
        return table.rows;
    }
    getTitle(type) {
        const titles = {
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
    async generatePDF(report) {
        return Buffer.from(JSON.stringify(report));
    }
    async generateDOCX(report) {
        return Buffer.from(JSON.stringify(report));
    }
    async generateHTML(report) {
        return `<html><body><h1>${report.title}</h1>${report.sections.map((s) => `<h2>${s.title}</h2><p>${s.content}</p>`).join("")}</body></html>`;
    }
}
//# sourceMappingURL=generator.js.map
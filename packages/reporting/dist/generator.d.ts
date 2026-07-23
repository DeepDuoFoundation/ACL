import type { ReportConfig, ReportData, GeneratedReport } from "./types.js";
export declare class ReportGenerator {
    private templates;
    constructor();
    generate(config: ReportConfig, data: ReportData): Promise<GeneratedReport>;
    private populateSections;
    private populateContent;
    private populateChartData;
    private populateTableRows;
    private getTitle;
    generatePDF(report: GeneratedReport): Promise<Buffer>;
    generateDOCX(report: GeneratedReport): Promise<Buffer>;
    generateHTML(report: GeneratedReport): Promise<string>;
}
//# sourceMappingURL=generator.d.ts.map
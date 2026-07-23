export type ReportType = "job_summary" | "tapeout_readiness" | "run_comparison" | "yield_prediction" | "rca_investigation" | "team_progress" | "customer_deliverable";
export interface ReportConfig {
    type: ReportType;
    format: "pdf" | "docx" | "html" | "json";
    includeCharts: boolean;
    includeRawData: boolean;
    branding?: {
        companyName: string;
        logo?: string;
    };
}
export interface ReportData {
    jobId?: string;
    designId?: string;
    pdk?: string;
    layer?: string;
    epeMap?: number[][];
    yieldPrediction?: number;
    metrics?: Record<string, number>;
    rcaResult?: Record<string, unknown>;
    teamStats?: Record<string, number>;
    timestamp: number;
}
export interface GeneratedReport {
    id: string;
    type: ReportType;
    title: string;
    sections: ReportSection[];
    metadata: Record<string, unknown>;
    generatedAt: number;
    format: string;
}
export interface ReportSection {
    title: string;
    content: string;
    charts?: ChartData[];
    tables?: TableData[];
}
export interface ChartData {
    type: "line" | "bar" | "heatmap" | "scatter";
    title: string;
    data: Record<string, unknown>;
}
export interface TableData {
    title: string;
    headers: string[];
    rows: string[][];
}
//# sourceMappingURL=types.d.ts.map
export class ReportTemplates {
    getTemplate(type) {
        switch (type) {
            case "job_summary":
                return this.jobSummaryTemplate();
            case "tapeout_readiness":
                return this.tapeoutReadinessTemplate();
            case "run_comparison":
                return this.runComparisonTemplate();
            case "yield_prediction":
                return this.yieldPredictionTemplate();
            case "rca_investigation":
                return this.rcaInvestigationTemplate();
            case "team_progress":
                return this.teamProgressTemplate();
            case "customer_deliverable":
                return this.customerDeliverableTemplate();
            default:
                return [];
        }
    }
    jobSummaryTemplate() {
        return [
            { title: "Executive Summary", content: "Job completed successfully with EPE within specification." },
            { title: "EPE Analysis", content: "Edge Placement Error metrics for all layers.", charts: [{ type: "heatmap", title: "EPE Heatmap", data: {} }] },
            { title: "Runtime Metrics", content: "GPU utilization and execution time." },
            { title: "Recommendations", content: "Top fix recommendations for improvement." },
        ];
    }
    tapeoutReadinessTemplate() {
        return [
            { title: "DFM Scorecard", content: "Design for Manufacturability assessment.", tables: [{ title: "DFM Scores", headers: ["Metric", "Score", "Status"], rows: [] }] },
            { title: "Yield Prediction", content: "Predicted die yield by region." },
            { title: "Spec Compliance", content: "Comparison against specification requirements." },
            { title: "Sign-off Checklist", content: "Approval checklist for tape-out release." },
        ];
    }
    runComparisonTemplate() {
        return [
            { title: "Comparison Overview", content: "Side-by-side comparison of two correction runs." },
            { title: "EPE Comparison", content: "Edge Placement Error delta between runs.", charts: [{ type: "bar", title: "EPE Delta", data: {} }] },
            { title: "Process Window", content: "Process window comparison." },
            { title: "Cost Analysis", content: "Mask complexity and cost comparison." },
        ];
    }
    yieldPredictionTemplate() {
        return [
            { title: "Yield Forecast", content: "Predicted die yield by region.", charts: [{ type: "bar", title: "Yield by Region", data: {} }] },
            { title: "Risk Hotspots", content: "Top yield-risk hotspots identified." },
            { title: "Recommended Changes", content: "Layout changes to improve yield." },
        ];
    }
    rcaInvestigationTemplate() {
        return [
            { title: "Symptom Summary", content: "Description of the observed failure." },
            { title: "Causal Chain", content: "Root cause analysis with evidence." },
            { title: "Digital Twin Validation", content: "Simulation results confirming root cause." },
            { title: "Corrective Actions", content: "Ranked fix recommendations with impact estimates." },
        ];
    }
    teamProgressTemplate() {
        return [
            { title: "Active Jobs", content: "Current job status and progress." },
            { title: "KPI Trends", content: "Key performance indicators over time.", charts: [{ type: "line", title: "KPI Trends", data: {} }] },
            { title: "Agent Efficiency", content: "Agent utilization and performance metrics." },
            { title: "Upcoming Approvals", content: "Pending HITL approvals." },
        ];
    }
    customerDeliverableTemplate() {
        return [
            { title: "Run Summary", content: "Sanitised run summary for external delivery." },
            { title: "EPE Summary", content: "Edge Placement Error summary tables." },
            { title: "Yield Summary", content: "Yield prediction summary." },
            { title: "Appendix", content: "IP-safe layout excerpts and additional data." },
        ];
    }
}
//# sourceMappingURL=templates.js.map
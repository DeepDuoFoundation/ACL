export interface WhiteLabelConfig {
    companyName: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    footerText: string;
    includeTimestamp: boolean;
    watermarked: boolean;
}
export declare class WhiteLabelRenderer {
    private config;
    constructor(config?: Partial<WhiteLabelConfig>);
    renderHeader(title: string): string;
    renderFooter(): string;
    renderSection(title: string, content: string): string;
    renderTable(headers: string[], rows: string[][]): string;
    renderFullReport(title: string, sections: {
        title: string;
        content: string;
    }[]): string;
    getConfig(): WhiteLabelConfig;
    updateConfig(updates: Partial<WhiteLabelConfig>): void;
}
//# sourceMappingURL=whitelabel.d.ts.map
export interface SearchResult {
    id: string;
    text: string;
    score: number;
    metadata: Record<string, unknown>;
}
export interface HybridSearchConfig {
    dbPath: string;
    vectorWeight?: number;
    keywordWeight?: number;
}
export declare class HybridSearch {
    private embedder;
    private vectorStore;
    private keywordStore;
    private vectorWeight;
    private keywordWeight;
    constructor(config: HybridSearchConfig);
    index(documents: Array<{
        id: string;
        text: string;
        metadata: Record<string, unknown>;
    }>): Promise<void>;
    search(query: string, topK?: number): Promise<SearchResult[]>;
}
//# sourceMappingURL=hybrid-search.d.ts.map
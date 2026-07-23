import { type SearchResult } from "./hybrid-search.js";
export declare class TsEmbeddingRetriever {
    private search;
    constructor(config: {
        dbPath: string;
    });
    retrieve(query: string, topK?: number): Promise<SearchResult[]>;
    index(documents: Array<{
        id: string;
        text: string;
        metadata: Record<string, unknown>;
    }>): Promise<void>;
}
//# sourceMappingURL=retriever.d.ts.map
export interface VectorDocument {
    id: string;
    vector: number[];
    text: string;
    metadata: Record<string, unknown>;
}
export interface LanceDBConfig {
    dbPath?: string;
    tableName?: string;
    dimension?: number;
}
export declare class VectorStore {
    private documents;
    private dbPath;
    private tableName;
    constructor(config?: LanceDBConfig);
    add(doc: VectorDocument): Promise<void>;
    search(queryVector: number[], topK?: number): Promise<Array<VectorDocument & {
        score: number;
    }>>;
    private cosineSimilarity;
}
//# sourceMappingURL=vector-store.d.ts.map
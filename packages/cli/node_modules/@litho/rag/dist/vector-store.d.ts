export interface VectorDocument {
    id: string;
    vector: number[];
    text: string;
    metadata: Record<string, unknown>;
}
export declare class VectorStore {
    private documents;
    add(doc: VectorDocument): Promise<void>;
    search(queryVector: number[], topK: number): Promise<VectorDocument[]>;
    private cosineSimilarity;
}
//# sourceMappingURL=vector-store.d.ts.map
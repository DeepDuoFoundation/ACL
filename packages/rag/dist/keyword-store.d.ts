export interface KeywordDocument {
    id: string;
    text: string;
    metadata: Record<string, unknown>;
}
export declare class KeywordStore {
    private index;
    private documents;
    add(doc: KeywordDocument): Promise<void>;
    search(query: string, topK: number): Promise<KeywordDocument[]>;
}
//# sourceMappingURL=keyword-store.d.ts.map
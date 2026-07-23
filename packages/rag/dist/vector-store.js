export class VectorStore {
    documents = [];
    dbPath;
    tableName;
    constructor(config = {}) {
        this.dbPath = config.dbPath || "./.lancedb";
        this.tableName = config.tableName || "litho_rag";
    }
    async add(doc) {
        const existingIdx = this.documents.findIndex((d) => d.id === doc.id);
        if (existingIdx >= 0) {
            this.documents[existingIdx] = doc;
        }
        else {
            this.documents.push(doc);
        }
    }
    async search(queryVector, topK = 5) {
        if (this.documents.length === 0)
            return [];
        return this.documents
            .map((doc) => ({
            ...doc,
            score: this.cosineSimilarity(queryVector, doc.vector),
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
    cosineSimilarity(a, b) {
        if (!a.length || !b.length || a.length !== b.length)
            return 0;
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dot / denom;
    }
}
//# sourceMappingURL=vector-store.js.map
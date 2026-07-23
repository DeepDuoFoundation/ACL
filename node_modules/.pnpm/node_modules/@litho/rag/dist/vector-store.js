export class VectorStore {
    documents = [];
    async add(doc) {
        this.documents.push(doc);
    }
    async search(queryVector, topK) {
        return this.documents
            .map((doc) => ({
            ...doc,
            score: this.cosineSimilarity(queryVector, doc.vector),
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
    cosineSimilarity(a, b) {
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
//# sourceMappingURL=vector-store.js.map
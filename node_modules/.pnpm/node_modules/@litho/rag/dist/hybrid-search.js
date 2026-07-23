import { Embedder } from "./embedder.js";
import { VectorStore } from "./vector-store.js";
import { KeywordStore } from "./keyword-store.js";
export class HybridSearch {
    embedder;
    vectorStore;
    keywordStore;
    vectorWeight;
    keywordWeight;
    constructor(config) {
        this.embedder = new Embedder();
        this.vectorStore = new VectorStore();
        this.keywordStore = new KeywordStore();
        this.vectorWeight = config.vectorWeight ?? 0.7;
        this.keywordWeight = config.keywordWeight ?? 0.3;
    }
    async index(documents) {
        const vectors = await this.embedder.embedBatch(documents.map((d) => d.text));
        for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];
            await this.vectorStore.add({ id: doc.id, vector: vectors[i], text: doc.text, metadata: doc.metadata });
            await this.keywordStore.add({ id: doc.id, text: doc.text, metadata: doc.metadata });
        }
    }
    async search(query, topK = 10) {
        const queryVector = await this.embedder.embed(query);
        const vectorResults = await this.vectorStore.search(queryVector, topK);
        const keywordResults = await this.keywordStore.search(query, topK);
        const scores = new Map();
        for (let i = 0; i < vectorResults.length; i++) {
            const doc = vectorResults[i];
            scores.set(doc.id, { text: doc.text, score: (1 - i / topK) * this.vectorWeight, metadata: doc.metadata });
        }
        for (let i = 0; i < keywordResults.length; i++) {
            const doc = keywordResults[i];
            const existing = scores.get(doc.id);
            const keywordScore = (1 - i / topK) * this.keywordWeight;
            if (existing) {
                existing.score += keywordScore;
            }
            else {
                scores.set(doc.id, { text: doc.text, score: keywordScore, metadata: doc.metadata });
            }
        }
        return [...scores.entries()]
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
}
//# sourceMappingURL=hybrid-search.js.map
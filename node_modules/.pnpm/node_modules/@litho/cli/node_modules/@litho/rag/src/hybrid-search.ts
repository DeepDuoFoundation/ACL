import { Embedder } from "./embedder.js";
import { VectorStore, type VectorDocument } from "./vector-store.js";
import { KeywordStore, type KeywordDocument } from "./keyword-store.js";

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

export class HybridSearch {
  private embedder: Embedder;
  private vectorStore: VectorStore;
  private keywordStore: KeywordStore;
  private vectorWeight: number;
  private keywordWeight: number;

  constructor(config: HybridSearchConfig) {
    this.embedder = new Embedder();
    this.vectorStore = new VectorStore();
    this.keywordStore = new KeywordStore();
    this.vectorWeight = config.vectorWeight ?? 0.7;
    this.keywordWeight = config.keywordWeight ?? 0.3;
  }

  async index(documents: Array<{ id: string; text: string; metadata: Record<string, unknown> }>): Promise<void> {
    const vectors = await this.embedder.embedBatch(documents.map((d) => d.text));
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      await this.vectorStore.add({ id: doc.id, vector: vectors[i], text: doc.text, metadata: doc.metadata });
      await this.keywordStore.add({ id: doc.id, text: doc.text, metadata: doc.metadata });
    }
  }

  async search(query: string, topK: number = 10): Promise<SearchResult[]> {
    const queryVector = await this.embedder.embed(query);
    const vectorResults = await this.vectorStore.search(queryVector, topK);
    const keywordResults = await this.keywordStore.search(query, topK);

    const scores = new Map<string, { text: string; score: number; metadata: Record<string, unknown> }>();
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
      } else {
        scores.set(doc.id, { text: doc.text, score: keywordScore, metadata: doc.metadata });
      }
    }

    return [...scores.entries()]
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

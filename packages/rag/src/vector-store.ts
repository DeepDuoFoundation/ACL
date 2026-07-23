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

export class VectorStore {
  private documents: VectorDocument[] = [];
  private dbPath: string;
  private tableName: string;

  constructor(config: LanceDBConfig = {}) {
    this.dbPath = config.dbPath || "./.lancedb";
    this.tableName = config.tableName || "litho_rag";
  }

  async add(doc: VectorDocument): Promise<void> {
    const existingIdx = this.documents.findIndex((d) => d.id === doc.id);
    if (existingIdx >= 0) {
      this.documents[existingIdx] = doc;
    } else {
      this.documents.push(doc);
    }
  }

  async search(queryVector: number[], topK: number = 5): Promise<Array<VectorDocument & { score: number }>> {
    if (this.documents.length === 0) return [];

    return this.documents
      .map((doc) => ({
        ...doc,
        score: this.cosineSimilarity(queryVector, doc.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length || a.length !== b.length) return 0;
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

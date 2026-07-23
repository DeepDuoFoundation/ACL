export interface VectorDocument {
  id: string;
  vector: number[];
  text: string;
  metadata: Record<string, unknown>;
}

export class VectorStore {
  private documents: VectorDocument[] = [];

  async add(doc: VectorDocument): Promise<void> {
    this.documents.push(doc);
  }

  async search(queryVector: number[], topK: number): Promise<VectorDocument[]> {
    return this.documents
      .map((doc) => ({
        ...doc,
        score: this.cosineSimilarity(queryVector, doc.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

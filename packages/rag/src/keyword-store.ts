export interface KeywordDocument {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
}

export class KeywordStore {
  private index = new Map<string, Set<string>>();
  private documents = new Map<string, KeywordDocument>();

  async add(doc: KeywordDocument): Promise<void> {
    this.documents.set(doc.id, doc);
    const terms = doc.text.toLowerCase().split(/\s+/);
    for (const term of terms) {
      if (!this.index.has(term)) this.index.set(term, new Set());
      this.index.get(term)!.add(doc.id);
    }
  }

  async search(query: string, topK: number): Promise<KeywordDocument[]> {
    const terms = query.toLowerCase().split(/\s+/);
    const scores = new Map<string, number>();
    for (const term of terms) {
      const ids = this.index.get(term);
      if (ids) {
        for (const id of ids) {
          scores.set(id, (scores.get(id) ?? 0) + 1);
        }
      }
    }
    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id]) => this.documents.get(id)!)
      .filter(Boolean);
  }
}

import { HybridSearch, type SearchResult } from "./hybrid-search.js";

export class TsEmbeddingRetriever {
  private search: HybridSearch;

  constructor(config: { dbPath: string }) {
    this.search = new HybridSearch(config);
  }

  async retrieve(query: string, topK?: number): Promise<SearchResult[]> {
    return this.search.search(query, topK);
  }

  async index(documents: Array<{ id: string; text: string; metadata: Record<string, unknown> }>): Promise<void> {
    return this.search.index(documents);
  }
}

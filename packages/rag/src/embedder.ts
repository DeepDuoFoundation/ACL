export class Embedder {
  async embed(text: string): Promise<number[]> {
    // Placeholder: return normalized random vector for testing
    // In production: use @xenova/transformers
    return Array.from({ length: 384 }, () => Math.random());
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}

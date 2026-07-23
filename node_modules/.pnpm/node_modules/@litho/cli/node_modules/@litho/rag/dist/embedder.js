export class Embedder {
    async embed(text) {
        // Placeholder: return normalized random vector for testing
        // In production: use @xenova/transformers
        return Array.from({ length: 384 }, () => Math.random());
    }
    async embedBatch(texts) {
        return Promise.all(texts.map((t) => this.embed(t)));
    }
}
//# sourceMappingURL=embedder.js.map
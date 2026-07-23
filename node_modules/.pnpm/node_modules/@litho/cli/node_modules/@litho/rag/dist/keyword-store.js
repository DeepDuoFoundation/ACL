export class KeywordStore {
    index = new Map();
    documents = new Map();
    async add(doc) {
        this.documents.set(doc.id, doc);
        const terms = doc.text.toLowerCase().split(/\s+/);
        for (const term of terms) {
            if (!this.index.has(term))
                this.index.set(term, new Set());
            this.index.get(term).add(doc.id);
        }
    }
    async search(query, topK) {
        const terms = query.toLowerCase().split(/\s+/);
        const scores = new Map();
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
            .map(([id]) => this.documents.get(id))
            .filter(Boolean);
    }
}
//# sourceMappingURL=keyword-store.js.map
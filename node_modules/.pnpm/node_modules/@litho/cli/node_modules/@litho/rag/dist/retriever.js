import { HybridSearch } from "./hybrid-search.js";
export class TsEmbeddingRetriever {
    search;
    constructor(config) {
        this.search = new HybridSearch(config);
    }
    async retrieve(query, topK) {
        return this.search.search(query, topK);
    }
    async index(documents) {
        return this.search.index(documents);
    }
}
//# sourceMappingURL=retriever.js.map
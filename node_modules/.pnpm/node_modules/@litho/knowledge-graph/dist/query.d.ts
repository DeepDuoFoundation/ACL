import type { KGNode } from "./types.js";
import { KnowledgeGraph } from "./graph.js";
export declare class QueryEngine {
    private kg;
    constructor(kg: KnowledgeGraph);
    queryCypher(query: string): Promise<KGNode[]>;
    private parseAndExecute;
    findByLayer(layer: string): Promise<KGNode[]>;
    findByPDK(pdk: string): Promise<KGNode[]>;
    findHotspots(designId: string): Promise<KGNode[]>;
    findRecipesForLayer(pdk: string, layer: string): Promise<KGNode[]>;
    findCausalChain(symptomId: string): Promise<KGNode[]>;
}
//# sourceMappingURL=query.d.ts.map
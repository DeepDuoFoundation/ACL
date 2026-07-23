import type { Symptom } from "./types.js";
interface KGNode {
    id: string;
    type: string;
    properties: Record<string, unknown>;
    connections: string[];
}
export declare class CausalGraph {
    private nodes;
    private edges;
    addNode(node: KGNode): void;
    addEdge(from: string, to: string, relationship: string, weight: number): void;
    traverse(startId: string, maxDepth: number): KGNode[];
    findRelatedNodes(symptom: Symptom): KGNode[];
    getNode(id: string): KGNode | undefined;
    getAllNodes(): KGNode[];
    getEdges(): Array<{
        from: string;
        to: string;
        relationship: string;
        weight: number;
    }>;
}
export {};
//# sourceMappingURL=causal-graph.d.ts.map
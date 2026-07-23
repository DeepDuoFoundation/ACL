import type { KGNode, KGEdge, KGConfig } from "./types.js";
export declare class KnowledgeGraph {
    private nodes;
    private edges;
    private adjacency;
    private config;
    constructor(config: KGConfig);
    addNode(node: KGNode): void;
    addEdge(edge: KGEdge): void;
    getNode(id: string): KGNode | undefined;
    getEdge(id: string): KGEdge | undefined;
    getNeighbors(nodeId: string): KGNode[];
    traverse(startId: string, maxDepth?: number): KGNode[];
    findByType(type: KGNode["type"]): KGNode[];
    findByProperty(key: string, value: unknown): KGNode[];
    findCausalPaths(sourceId: string, targetId: string): Array<{
        nodes: KGNode[];
        edges: KGEdge[];
        confidence: number;
    }>;
    getAllNodes(): KGNode[];
    getAllEdges(): KGEdge[];
    getStats(): {
        nodeCount: number;
        edgeCount: number;
        byType: Record<string, number>;
    };
}
//# sourceMappingURL=graph.d.ts.map
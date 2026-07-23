export type NodeType = "design" | "layer" | "recipe" | "process" | "equipment" | "yield" | "hotspot" | "tapeout";
export interface KGNode {
    id: string;
    type: NodeType;
    properties: Record<string, unknown>;
    confidence: number;
    createdAt: number;
    updatedAt: number;
}
export interface KGEdge {
    id: string;
    source: string;
    target: string;
    relationship: string;
    weight: number;
    properties: Record<string, unknown>;
    createdAt: number;
}
export interface Recipe {
    id: string;
    name: string;
    pdk: string;
    layer: string;
    parameters: Record<string, unknown>;
    successRate: number;
    usageCount: number;
    confidence: number;
    createdAt: number;
}
export interface CausalPath {
    nodes: KGNode[];
    edges: KGEdge[];
    confidence: number;
}
export interface KGConfig {
    maxTraversalDepth: number;
    minConfidence: number;
    maxResults: number;
}
//# sourceMappingURL=types.d.ts.map
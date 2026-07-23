export type KGNodeType =
  | "layout"
  | "mask"
  | "opc_recipe"
  | "process_parameters"
  | "defect_record"
  | "yield_record"
  | "hotspot"
  | "correction_history";

export interface KGNode {
  id: string;
  type: KGNodeType;
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface KGEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface KGQueryResult {
  nodes: KGNode[];
  edges: KGEdge[];
  executionTimeMs: number;
}

export interface RecipeMatch {
  recipeId: string;
  similarity: number;
  yieldOutcome: number;
  properties: Record<string, unknown>;
}

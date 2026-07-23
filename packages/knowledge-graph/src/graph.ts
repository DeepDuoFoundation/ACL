import type { KGNode, KGEdge, KGConfig } from "./types.js";

export class KnowledgeGraph {
  private nodes = new Map<string, KGNode>();
  private edges = new Map<string, KGEdge>();
  private adjacency = new Map<string, Set<string>>();
  private config: KGConfig;

  constructor(config: KGConfig) {
    this.config = config;
  }

  addNode(node: KGNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, new Set());
    }
  }

  addEdge(edge: KGEdge): void {
    this.edges.set(edge.id, edge);
    const neighbors = this.adjacency.get(edge.source) ?? new Set();
    neighbors.add(edge.target);
    this.adjacency.set(edge.source, neighbors);
  }

  getNode(id: string): KGNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): KGEdge | undefined {
    return this.edges.get(id);
  }

  getNeighbors(nodeId: string): KGNode[] {
    const neighborIds = this.adjacency.get(nodeId) ?? new Set();
    return Array.from(neighborIds)
      .map((id) => this.nodes.get(id))
      .filter((n): n is KGNode => n !== undefined);
  }

  traverse(startId: string, maxDepth?: number): KGNode[] {
    const depth = maxDepth ?? this.config.maxTraversalDepth;
    const visited = new Set<string>();
    const result: KGNode[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth: currentDepth } = queue.shift()!;
      if (visited.has(id) || currentDepth > depth) continue;
      visited.add(id);

      const node = this.nodes.get(id);
      if (node && node.confidence >= this.config.minConfidence) {
        result.push(node);
        const neighbors = this.adjacency.get(id) ?? new Set();
        for (const neighborId of neighbors) {
          queue.push({ id: neighborId, depth: currentDepth + 1 });
        }
      }
    }

    return result.slice(0, this.config.maxResults);
  }

  findByType(type: KGNode["type"]): KGNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.type === type);
  }

  findByProperty(key: string, value: unknown): KGNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.properties[key] === value);
  }

  findCausalPaths(sourceId: string, targetId: string): Array<{ nodes: KGNode[]; edges: KGEdge[]; confidence: number }> {
    const paths: Array<{ nodes: KGNode[]; edges: KGEdge[]; confidence: number }> = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: KGNode[], edgePath: KGEdge[]): void => {
      if (currentId === targetId) {
        const confidence = path.reduce((min, n) => Math.min(min, n.confidence), 1);
        paths.push({ nodes: [...path], edges: [...edgePath], confidence });
        return;
      }

      if (visited.has(currentId) || path.length > this.config.maxTraversalDepth) return;
      visited.add(currentId);

      const neighbors = this.adjacency.get(currentId) ?? new Set();
      for (const neighborId of neighbors) {
        const node = this.nodes.get(neighborId);
        const edge = Array.from(this.edges.values()).find(
          (e) => e.source === currentId && e.target === neighborId
        );

        if (node && edge) {
          path.push(node);
          edgePath.push(edge);
          dfs(neighborId, path, edgePath);
          path.pop();
          edgePath.pop();
        }
      }

      visited.delete(currentId);
    };

    dfs(sourceId, [], []);
    return paths;
  }

  getAllNodes(): KGNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): KGEdge[] {
    return Array.from(this.edges.values());
  }

  getStats(): { nodeCount: number; edgeCount: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    for (const node of this.nodes.values()) {
      byType[node.type] = (byType[node.type] ?? 0) + 1;
    }
    return { nodeCount: this.nodes.size, edgeCount: this.edges.size, byType };
  }
}

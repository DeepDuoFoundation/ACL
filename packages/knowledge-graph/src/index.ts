/**
 * Manufacturing Knowledge Graph — Neo4j-based cross-tapeout institutional memory
 * PRD §5.3: Semantic graph connecting layouts, masks, OPC recipes, defects, yield
 */

export interface KGNode {
  id: string;
  type: 'layout' | 'mask' | 'opc_recipe' | 'process_params' | 'defect' | 'yield_record' | 'hotspot' | 'correction_history';
  attributes: Record<string, any>;
  embeddings?: number[];
  createdAt: string;
}

export interface KGEdge {
  sourceId: string;
  targetId: string;
  type: string;
  weight: number;
  metadata?: Record<string, any>;
}

export interface KGSearchResult {
  node: KGNode;
  score: number;
  path: string[];
  evidence: string[];
}

export class KnowledgeGraph {
  private nodes: Map<string, KGNode> = new Map();
  private edges: Map<string, KGEdge[]> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  async addNode(node: KGNode): Promise<void> {
    this.nodes.set(node.id, node);
  }

  async addEdge(edge: KGEdge): Promise<void> {
    const existing = this.edges.get(edge.sourceId) || [];
    existing.push(edge);
    this.edges.set(edge.sourceId, existing);
  }

  async findSimilar(layoutHash: string, minSimilarity = 0.8): Promise<KGSearchResult[]> {
    const results: KGSearchResult[] = [];
    for (const [id, node] of this.nodes) {
      if (node.type === 'layout' && id !== layoutHash) {
        const score = this.computeSimilarity(layoutHash, id);
        if (score >= minSimilarity) {
          const path = this.traversePath(id, layoutHash);
          results.push({
            node,
            score,
            path,
            evidence: this.getEvidence(id),
          });
        }
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }

  async queryCausal(failureType: string, layer: string): Promise<{ cause: string; probability: number; evidence: string[] }[]> {
    const hypotheses: { cause: string; probability: number; evidence: string[] }[] = [];
    for (const [id, node] of this.nodes) {
      if (node.type === 'defect' && node.attributes.layer === layer) {
        const connected = this.edges.get(id) || [];
        for (const edge of connected) {
          const target = this.nodes.get(edge.targetId);
          if (target && target.type === 'process_params') {
            hypotheses.push({
              cause: `${target.attributes.parameter} deviation (${target.attributes.value})`,
              probability: edge.weight,
              evidence: [`Defect ${id} connected to ${target.id}`, `Edge weight: ${edge.weight}`],
            });
          }
        }
      }
    }
    return hypotheses.sort((a, b) => b.probability - a.probability);
  }

  async getRecipeGenealogy(recipeId: string): Promise<{ version: number; changes: string; yield: number; timestamp: string }[]> {
    const history: { version: number; changes: string; yield: number; timestamp: string }[] = [];
    for (const [id, node] of this.nodes) {
      if (node.type === 'correction_history' && node.attributes.recipeId === recipeId) {
        history.push({
          version: node.attributes.version || 0,
          changes: node.attributes.changes || '',
          yield: node.attributes.yield || 0,
          timestamp: node.createdAt,
        });
      }
    }
    return history.sort((a, b) => b.version - a.version);
  }

  async getHotspotLibrary(): Promise<KGNode[]> {
    return Array.from(this.nodes.values())
      .filter((n) => n.type === 'hotspot')
      .sort((a, b) => (b.attributes.severity || 0) - (a.attributes.severity || 0));
  }

  async search(query: string): Promise<KGSearchResult[]> {
    const q = query.toLowerCase();
    const results: KGSearchResult[] = [];
    for (const [id, node] of this.nodes) {
      let score = 0;
      const attrs = JSON.stringify(node.attributes).toLowerCase();
      if (attrs.includes(q)) score += attrs.split(q).length - 1;
      if (node.type.toLowerCase().includes(q)) score += 2;
      if (score > 0) {
        results.push({ node, score, path: [id], evidence: [`Matched query "${q}"`] });
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }

  getStats(): { nodes: number; edges: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    for (const node of this.nodes.values()) {
      types[node.type] = (types[node.type] || 0) + 1;
    }
    return { nodes: this.nodes.size, edges: this.edges.size, types };
  }

  private computeSimilarity(a: string, b: string): number {
    // Simple Jaccard similarity on attribute keys
    const nodeA = this.nodes.get(a);
    const nodeB = this.nodes.get(b);
    if (!nodeA || !nodeB) return 0;
    const keysA = new Set(Object.keys(nodeA.attributes));
    const keysB = new Set(Object.keys(nodeB.attributes));
    const intersection = new Set([...keysA].filter((k) => keysB.has(k)));
    const union = new Set([...keysA, ...keysB]);
    return intersection.size / union.size;
  }

  private traversePath(from: string, to: string): string[] {
    // BFS shortest path
    const visited = new Set<string>();
    const queue: string[][] = [[from]];
    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      if (current === to) return path;
      if (visited.has(current)) continue;
      visited.add(current);
      const connected = this.edges.get(current) || [];
      for (const edge of connected) {
        if (!visited.has(edge.targetId)) {
          queue.push([...path, edge.targetId]);
        }
      }
    }
    return [];
  }

  private getEvidence(nodeId: string): string[] {
    const evidence: string[] = [];
    const connected = this.edges.get(nodeId) || [];
    for (const edge of connected) {
      const target = this.nodes.get(edge.targetId);
      if (target) {
        evidence.push(`${edge.type} → ${target.type}: ${JSON.stringify(target.attributes).slice(0, 100)}`);
      }
    }
    return evidence.slice(0, 5);
  }
}
import type { Symptom, Hypothesis } from "./types.js";

interface KGNode {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  connections: string[];
}

export class CausalGraph {
  private nodes = new Map<string, KGNode>();
  private edges = new Array<{ from: string; to: string; relationship: string; weight: number }>();

  addNode(node: KGNode): void {
    this.nodes.set(node.id, node);
  }

  addEdge(from: string, to: string, relationship: string, weight: number): void {
    this.edges.push({ from, to, relationship, weight });
  }

  traverse(startId: string, maxDepth: number): KGNode[] {
    const visited = new Set<string>();
    const result: KGNode[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id) || depth > maxDepth) continue;
      visited.add(id);

      const node = this.nodes.get(id);
      if (node) {
        result.push(node);
        for (const conn of node.connections) {
          queue.push({ id: conn, depth: depth + 1 });
        }
      }
    }

    return result;
  }

  findRelatedNodes(symptom: Symptom): KGNode[] {
    const related: KGNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.type === "layer" && node.properties.name === symptom.layer) {
        related.push(node);
      }
      if (node.type === "process" && node.properties.location === symptom.location) {
        related.push(node);
      }
    }
    return related;
  }

  getNode(id: string): KGNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): KGNode[] {
    return Array.from(this.nodes.values());
  }

  getEdges(): Array<{ from: string; to: string; relationship: string; weight: number }> {
    return [...this.edges];
  }
}

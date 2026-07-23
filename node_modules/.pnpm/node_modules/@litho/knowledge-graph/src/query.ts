import type { KGNode, KGConfig } from "./types.js";
import { KnowledgeGraph } from "./graph.js";

export class QueryEngine {
  private kg: KnowledgeGraph;

  constructor(kg: KnowledgeGraph) {
    this.kg = kg;
  }

  async queryCypher(query: string): Promise<KGNode[]> {
    const lower = query.toLowerCase();

    if (lower.includes("match")) {
      return this.parseAndExecute(lower);
    }

    return [];
  }

  private parseAndExecute(query: string): KGNode[] {
    if (query.includes(":design") || (query.includes("type:") && query.includes("design"))) {
      return this.kg.findByType("design");
    }
    if (query.includes(":recipe") || (query.includes("type:") && query.includes("recipe"))) {
      return this.kg.findByType("recipe");
    }
    if (query.includes(":hotspot") || (query.includes("type:") && query.includes("hotspot"))) {
      return this.kg.findByType("hotspot");
    }
    return [];
  }

  async findByLayer(layer: string): Promise<KGNode[]> {
    return this.kg.findByProperty("layer", layer);
  }

  async findByPDK(pdk: string): Promise<KGNode[]> {
    return this.kg.findByProperty("pdk", pdk);
  }

  async findHotspots(designId: string): Promise<KGNode[]> {
    const designNodes = this.kg.findByProperty("designId", designId);
    const hotspots: KGNode[] = [];

    for (const node of designNodes) {
      const neighbors = this.kg.getNeighbors(node.id);
      for (const neighbor of neighbors) {
        if (neighbor.type === "hotspot") {
          hotspots.push(neighbor);
        }
      }
    }

    return hotspots;
  }

  async findRecipesForLayer(pdk: string, layer: string): Promise<KGNode[]> {
    const recipes = this.kg.findByType("recipe");
    return recipes.filter((r) => r.properties.pdk === pdk && r.properties.layer === layer);
  }

  async findCausalChain(symptomId: string): Promise<KGNode[]> {
    const symptom = this.kg.getNode(symptomId);
    if (!symptom) return [];

    const paths = this.kg.findCausalPaths(symptomId, "");
    if (paths.length === 0) return this.kg.traverse(symptomId, 3);

    return paths[0].nodes;
  }
}

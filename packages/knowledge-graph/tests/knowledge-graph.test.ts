import { describe, it, expect } from "vitest";
import { KnowledgeGraph } from "../src/graph.js";
import { QueryEngine } from "../src/query.js";
import { RecipeLibrary } from "../src/recipes.js";
import type { KGNode, KGEdge, KGConfig, Recipe } from "../src/types.js";

const testConfig: KGConfig = {
  maxTraversalDepth: 3,
  minConfidence: 0.5,
  maxResults: 100,
};

const testNode: KGNode = {
  id: "node-1",
  type: "design",
  properties: { name: "test-design", pdk: "TSMC N3E" },
  confidence: 0.9,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const testRecipe: Recipe = {
  id: "recipe-1",
  name: "M1-OPC-001",
  pdk: "TSMC N3E",
  layer: "M1",
  parameters: { aggressiveness: 0.8 },
  successRate: 0.95,
  usageCount: 10,
  confidence: 0.9,
  createdAt: Date.now(),
};

describe("KnowledgeGraph", () => {
  it("should add and retrieve nodes", () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode(testNode);

    const node = kg.getNode("node-1");
    expect(node).toBeDefined();
    expect(node!.type).toBe("design");
  });

  it("should add and retrieve edges", () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode(testNode);
    kg.addNode({ ...testNode, id: "node-2", type: "layer" });
    kg.addEdge({
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      relationship: "has_layer",
      weight: 0.9,
      properties: {},
      createdAt: Date.now(),
    });

    const edge = kg.getEdge("edge-1");
    expect(edge).toBeDefined();
    expect(edge!.relationship).toBe("has_layer");
  });

  it("should traverse graph", () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode(testNode);
    kg.addNode({ ...testNode, id: "node-2", type: "layer" });
    kg.addEdge({
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      relationship: "has_layer",
      weight: 0.9,
      properties: {},
      createdAt: Date.now(),
    });

    const result = kg.traverse("node-1");
    expect(result.length).toBe(2);
  });

  it("should find nodes by type", () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode(testNode);
    kg.addNode({ ...testNode, id: "node-2", type: "recipe" });

    const designs = kg.findByType("design");
    expect(designs.length).toBe(1);
  });

  it("should find nodes by property", () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode(testNode);

    const found = kg.findByProperty("pdk", "TSMC N3E");
    expect(found.length).toBe(1);
  });

  it("should compute stats", () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode(testNode);
    kg.addNode({ ...testNode, id: "node-2", type: "recipe" });

    const stats = kg.getStats();
    expect(stats.nodeCount).toBe(2);
    expect(stats.byType.design).toBe(1);
    expect(stats.byType.recipe).toBe(1);
  });
});

describe("QueryEngine", () => {
  it("should query by type", async () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode(testNode);
    const engine = new QueryEngine(kg);

    const results = await engine.queryCypher("MATCH (n:design) RETURN n");
    expect(results.length).toBe(1);
  });

  it("should find by layer", async () => {
    const kg = new KnowledgeGraph(testConfig);
    kg.addNode({ ...testNode, properties: { layer: "M1" } });
    const engine = new QueryEngine(kg);

    const results = await engine.findByLayer("M1");
    expect(results.length).toBe(1);
  });
});

describe("RecipeLibrary", () => {
  it("should add and retrieve recipes", async () => {
    const kg = new KnowledgeGraph(testConfig);
    const lib = new RecipeLibrary(kg);
    await lib.addRecipe(testRecipe);

    const recipe = await lib.getRecipe("recipe-1");
    expect(recipe).toBeDefined();
    expect(recipe!.name).toBe("M1-OPC-001");
  });

  it("should find recipes by PDK and layer", async () => {
    const kg = new KnowledgeGraph(testConfig);
    const lib = new RecipeLibrary(kg);
    await lib.addRecipe(testRecipe);

    const recipes = await lib.findRecipes("TSMC N3E", "M1");
    expect(recipes.length).toBe(1);
  });

  it("should update success rate", async () => {
    const kg = new KnowledgeGraph(testConfig);
    const lib = new RecipeLibrary(kg);
    await lib.addRecipe(testRecipe);

    await lib.updateSuccessRate("recipe-1", true);
    const recipe = await lib.getRecipe("recipe-1");
    expect(recipe!.usageCount).toBe(11);
  });

  it("should promote and demote recipes", async () => {
    const kg = new KnowledgeGraph(testConfig);
    const lib = new RecipeLibrary(kg);
    await lib.addRecipe(testRecipe);

    await lib.promoteRecipe("recipe-1");
    let recipe = await lib.getRecipe("recipe-1");
    expect(recipe!.confidence).toBeGreaterThan(0.9);

    await lib.demoteRecipe("recipe-1");
    recipe = await lib.getRecipe("recipe-1");
    expect(recipe!.confidence).toBeLessThanOrEqual(0.9);
  });

  it("should compute stats", async () => {
    const kg = new KnowledgeGraph(testConfig);
    const lib = new RecipeLibrary(kg);
    const freshRecipe = { ...testRecipe, id: "recipe-stats", usageCount: 0, successRate: 0.95 };
    await lib.addRecipe(freshRecipe);

    const stats = lib.getStats();
    expect(stats.totalRecipes).toBe(1);
    expect(stats.avgSuccessRate).toBe(0.95);
  });
});

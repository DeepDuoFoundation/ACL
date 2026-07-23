import { describe, it, expect } from "vitest";
import { HybridSearch } from "../src/hybrid-search.js";

describe("HybridSearch", () => {
  it("should index and search documents", async () => {
    const search = new HybridSearch({ dbPath: ":memory:" });
    await search.index([
      { id: "1", text: "OPC recipe for SRAM Metal Layer 3", metadata: { type: "recipe" } },
      { id: "2", text: "EPE spike investigation on Metal Layer 3", metadata: { type: "rca" } },
    ]);
    const results = await search.search("Metal Layer 3 EPE");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBeDefined();
  });
});

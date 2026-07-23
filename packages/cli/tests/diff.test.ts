import { describe, it, expect } from "vitest";
import { compareRuns, RunMetrics } from "../src/commands/diff.js";

describe("CLI diffCommand", () => {
  it("computes metric deltas and renders formatted diff", () => {
    const runA: RunMetrics = {
      jobId: "job-001",
      epeRms: 1.5,
      pvBandArea: 0.20,
      maskVertices: 100000,
      runtimeMinutes: 60.0,
      costPerDie: 15.0,
    };

    const runB: RunMetrics = {
      jobId: "job-002",
      epeRms: 0.9,
      pvBandArea: 0.25,
      maskVertices: 120000,
      runtimeMinutes: 40.0,
      costPerDie: 12.0,
    };

    const diffOutput = compareRuns(runA, runB);
    expect(diffOutput).toContain("LithoMind Run Diff: job-001 ↔ job-002");
    expect(diffOutput).toContain("EPE RMS Error:");
    expect(diffOutput).toContain("1.5nm  →  0.9nm");
    expect(diffOutput).toContain("-0.6nm");
  });
});

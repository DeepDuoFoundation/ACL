export interface RunMetrics {
  jobId: string;
  epeRms: number;       // nm
  pvBandArea: number;   // µm²
  maskVertices: number;
  runtimeMinutes: number;
  costPerDie: number;   // $
}

export function compareRuns(runA: RunMetrics, runB: RunMetrics): string {
  const epeDiff = (runB.epeRms - runA.epeRms).toFixed(3);
  const pvDiff = (runB.pvBandArea - runA.pvBandArea).toFixed(3);
  const vertDiff = runB.maskVertices - runA.maskVertices;
  const timeDiff = (runB.runtimeMinutes - runA.runtimeMinutes).toFixed(1);
  const costDiff = (runB.costPerDie - runA.costPerDie).toFixed(2);

  const formatDelta = (val: number, unit: string = "", lowerIsBetter: boolean = true) => {
    const isImproved = lowerIsBetter ? val < 0 : val > 0;
    const sign = val > 0 ? "+" : "";
    const text = `${sign}${val}${unit}`;
    if (val === 0) return `\x1b[90m${text}\x1b[0m`;
    return isImproved ? `\x1b[32m${text}\x1b[0m` : `\x1b[31m${text}\x1b[0m`;
  };

  const lines = [
    `\x1b[1m=== LithoMind Run Diff: ${runA.jobId} ↔ ${runB.jobId} ===\x1b[0m`,
    `EPE RMS Error:       ${runA.epeRms}nm  →  ${runB.epeRms}nm  (${formatDelta(parseFloat(epeDiff), "nm")})`,
    `PV-Band Area:        ${runA.pvBandArea}µm² → ${runB.pvBandArea}µm² (${formatDelta(parseFloat(pvDiff), "µm²")})`,
    `Mask Complexity:     ${runA.maskVertices}  →  ${runB.maskVertices}   (${formatDelta(vertDiff, " vertices")})`,
    `Execution Time:      ${runA.runtimeMinutes}m → ${runB.runtimeMinutes}m  (${formatDelta(parseFloat(timeDiff), "m")})`,
    `Est. Die Cost:       $${runA.costPerDie} → $${runB.costPerDie} (${formatDelta(parseFloat(costDiff), "$")})`,
  ];

  return lines.join("\n");
}

export async function diffCommand(runAId?: string, runBId?: string) {
  const dummyA: RunMetrics = {
    jobId: runAId || "runs/job-042",
    epeRms: 1.25,
    pvBandArea: 0.18,
    maskVertices: 125000,
    runtimeMinutes: 45.0,
    costPerDie: 12.5,
  };

  const dummyB: RunMetrics = {
    jobId: runBId || "runs/job-043",
    epeRms: 0.88,
    pvBandArea: 0.22,
    maskVertices: 142000,
    runtimeMinutes: 38.5,
    costPerDie: 10.8,
  };

  console.log(compareRuns(dummyA, dummyB));
}

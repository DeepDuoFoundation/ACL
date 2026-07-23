import type { PDKConfig } from "./types.js";

export const Intel18A: PDKConfig = {
  name: "intel-18a",
  node: "18A",
  vendor: "Intel Foundry",
  version: "1.0.0",
  layers: [
    { name: "Gate", type: "poly", minWidth: 18, minPitch: 48, minSpacing: 16, opacity: 1.0 },
    { name: "Metal1", type: "metal", minWidth: 21, minPitch: 42, minSpacing: 18, opacity: 0.8 },
    { name: "Metal2", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 20, opacity: 0.8 },
    { name: "Metal3", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.8 },
    { name: "Via1", type: "via", minWidth: 20, minPitch: 42, minSpacing: 18, opacity: 0.6 },
  ],
  opcRules: [
    { layer: "Gate", type: "model_based", aggressiveness: 0.9, maxIterations: 15, convergenceThreshold: 0.5 },
    { layer: "Metal1", type: "model_based", aggressiveness: 0.8, maxIterations: 12, convergenceThreshold: 0.8 },
    { layer: "Metal2", type: "rule_based", aggressiveness: 0.7, maxIterations: 10, convergenceThreshold: 1.0 },
  ],
  designRules: [
    { name: "minGateLength", description: "Minimum gate length", min: 18, layer: "Gate" },
    { name: "minMetalWidth", description: "Minimum metal width", min: 21, layer: "Metal1" },
    { name: "minMetalPitch", description: "Minimum metal pitch", min: 42, layer: "Metal1" },
    { name: "minSpacing", description: "Minimum spacing", min: 16, layer: "Gate" },
    { name: "minViaSize", description: "Minimum via size", min: 20, layer: "Via1" },
  ],
  illumination: { wavelength: 13.5, na: 0.55, sigma: 0.85, polarization: "quadrupole" },
  resist: { type: "EUV_positive", thickness: 30, sensitivity: 40 },
};

import type { PDKConfig } from "./types.js";

export const UMC22nm: PDKConfig = {
  name: "UMC 22nm",
  node: "22nm",
  vendor: "UMC",
  version: "1.0",
  layers: [
    { name: "M1", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.8 },
    { name: "M2", type: "metal", minWidth: 32, minPitch: 64, minSpacing: 28, opacity: 0.8 },
    { name: "M3", type: "metal", minWidth: 40, minPitch: 80, minSpacing: 32, opacity: 0.8 },
    { name: "V0", type: "via", minWidth: 26, minPitch: 56, minSpacing: 24, opacity: 0.6 },
    { name: "Poly", type: "poly", minWidth: 22, minPitch: 64, minSpacing: 22, opacity: 0.9 },
    { name: "OD", type: "diffusion", minWidth: 30, minPitch: 60, minSpacing: 26, opacity: 0.7 },
    { name: "NWell", type: "well", minWidth: 90, minPitch: 180, minSpacing: 90, opacity: 0.4 },
  ],
  opcRules: [
    { layer: "M1", type: "rule_based", aggressiveness: 0.7, maxIterations: 8, convergenceThreshold: 1.0 },
    { layer: "M2", type: "rule_based", aggressiveness: 0.65, maxIterations: 8, convergenceThreshold: 1.2 },
    { layer: "Poly", type: "model_based", aggressiveness: 0.8, maxIterations: 10, convergenceThreshold: 0.8 },
    { layer: "V0", type: "rule_based", aggressiveness: 0.5, maxIterations: 6, convergenceThreshold: 1.5 },
  ],
  designRules: [
    { name: "min_width", description: "Minimum metal width", min: 28, layer: "M1" },
    { name: "min_pitch", description: "Minimum metal pitch", min: 56, layer: "M1" },
    { name: "min_spacing", description: "Minimum metal spacing", min: 24, layer: "M1" },
    { name: "min_area", description: "Minimum metal area", min: 180, layer: "M1" },
    { name: "min_via_size", description: "Minimum via size", min: 26, layer: "V0" },
  ],
  illumination: { wavelength: 193, na: 1.2, sigma: 0.85, polarization: "C-quad" },
  resist: { type: "ArF", thickness: 120, sensitivity: 38 },
};

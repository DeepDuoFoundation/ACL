import type { PDKConfig } from "./types.js";

export const GF22FDX: PDKConfig = {
  name: "GF 22FDX",
  node: "22FDX",
  vendor: "GlobalFoundries",
  version: "1.0",
  layers: [
    { name: "M1", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 20, opacity: 0.8 },
    { name: "M2", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.8 },
    { name: "M3", type: "metal", minWidth: 32, minPitch: 64, minSpacing: 28, opacity: 0.8 },
    { name: "V0", type: "via", minWidth: 22, minPitch: 48, minSpacing: 20, opacity: 0.6 },
    { name: "Poly", type: "poly", minWidth: 22, minPitch: 60, minSpacing: 20, opacity: 0.9 },
    { name: "OD", type: "diffusion", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.7 },
    { name: "NWell", type: "well", minWidth: 80, minPitch: 160, minSpacing: 80, opacity: 0.4 },
  ],
  opcRules: [
    { layer: "M1", type: "model_based", aggressiveness: 0.75, maxIterations: 10, convergenceThreshold: 0.8 },
    { layer: "M2", type: "rule_based", aggressiveness: 0.7, maxIterations: 8, convergenceThreshold: 1.0 },
    { layer: "Poly", type: "ilt", aggressiveness: 0.85, maxIterations: 12, convergenceThreshold: 0.6 },
    { layer: "V0", type: "rule_based", aggressiveness: 0.5, maxIterations: 6, convergenceThreshold: 1.2 },
  ],
  designRules: [
    { name: "min_width", description: "Minimum metal width", min: 24, layer: "M1" },
    { name: "min_pitch", description: "Minimum metal pitch", min: 48, layer: "M1" },
    { name: "min_spacing", description: "Minimum metal spacing", min: 20, layer: "M1" },
    { name: "min_area", description: "Minimum metal area", min: 140, layer: "M1" },
    { name: "min_via_size", description: "Minimum via size", min: 22, layer: "V0" },
    { name: "fdsoi_backgate", description: "FDSOI back-gate bias range", min: -2000, max: 2000 },
  ],
  illumination: { wavelength: 193, na: 1.2, sigma: 0.9, polarization: "dipole" },
  resist: { type: "ArF", thickness: 100, sensitivity: 35 },
};

import type { PDKConfig } from "./types.js";

export const TSMCN3E: PDKConfig = {
  name: "TSMC N3E",
  node: "3nm",
  vendor: "TSMC",
  version: "1.0",
  layers: [
    { name: "M1", type: "metal", minWidth: 21, minPitch: 42, minSpacing: 21, opacity: 0.8 },
    { name: "M2", type: "metal", minWidth: 21, minPitch: 42, minSpacing: 21, opacity: 0.8 },
    { name: "M3", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 24, opacity: 0.8 },
    { name: "V0", type: "via", minWidth: 18, minPitch: 42, minSpacing: 18, opacity: 0.6 },
    { name: "V1", type: "via", minWidth: 18, minPitch: 48, minSpacing: 18, opacity: 0.6 },
    { name: "Poly", type: "poly", minWidth: 18, minPitch: 36, minSpacing: 18, opacity: 0.9 },
    { name: "OD", type: "diffusion", minWidth: 24, minPitch: 48, minSpacing: 24, opacity: 0.7 },
    { name: "NWell", type: "well", minWidth: 60, minPitch: 120, minSpacing: 60, opacity: 0.4 },
  ],
  opcRules: [
    { layer: "M1", type: "model_based", aggressiveness: 0.8, maxIterations: 100, convergenceThreshold: 0.5 },
    { layer: "M2", type: "model_based", aggressiveness: 0.8, maxIterations: 100, convergenceThreshold: 0.5 },
    { layer: "Poly", type: "ilt", aggressiveness: 0.9, maxIterations: 200, convergenceThreshold: 0.3 },
    { layer: "V0", type: "rule_based", aggressiveness: 0.6, maxIterations: 50, convergenceThreshold: 1.0 },
  ],
  designRules: [
    { name: "min_width", description: "Minimum metal width", min: 21, layer: "M1" },
    { name: "min_pitch", description: "Minimum metal pitch", min: 42, layer: "M1" },
    { name: "min_spacing", description: "Minimum metal spacing", min: 21, layer: "M1" },
    { name: "min_area", description: "Minimum metal area", min: 100, layer: "M1" },
    { name: "min_via_size", description: "Minimum via size", min: 18, layer: "V0" },
  ],
  illumination: {
    wavelength: 13.5,
    na: 0.55,
    sigma: 0.8,
    polarization: "quadrupole",
  },
  resist: {
    type: "CAR",
    thickness: 30,
    sensitivity: 50,
  },
};

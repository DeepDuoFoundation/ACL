import type { PDKConfig } from "./types.js";

export const SamsungSF3: PDKConfig = {
  name: "Samsung SF3",
  node: "3nm",
  vendor: "Samsung",
  version: "1.0",
  layers: [
    { name: "M1", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 24, opacity: 0.8 },
    { name: "M2", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 24, opacity: 0.8 },
    { name: "M3", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 28, opacity: 0.8 },
    { name: "V0", type: "via", minWidth: 20, minPitch: 48, minSpacing: 20, opacity: 0.6 },
    { name: "V1", type: "via", minWidth: 20, minPitch: 56, minSpacing: 20, opacity: 0.6 },
    { name: "Poly", type: "poly", minWidth: 20, minPitch: 40, minSpacing: 20, opacity: 0.9 },
    { name: "OD", type: "diffusion", minWidth: 28, minPitch: 56, minSpacing: 28, opacity: 0.7 },
    { name: "NWell", type: "well", minWidth: 70, minPitch: 140, minSpacing: 70, opacity: 0.4 },
  ],
  opcRules: [
    { layer: "M1", type: "model_based", aggressiveness: 0.75, maxIterations: 80, convergenceThreshold: 0.6 },
    { layer: "M2", type: "model_based", aggressiveness: 0.75, maxIterations: 80, convergenceThreshold: 0.6 },
    { layer: "Poly", type: "ilt", aggressiveness: 0.85, maxIterations: 180, convergenceThreshold: 0.4 },
    { layer: "V0", type: "rule_based", aggressiveness: 0.5, maxIterations: 40, convergenceThreshold: 1.2 },
  ],
  designRules: [
    { name: "min_width", description: "Minimum metal width", min: 24, layer: "M1" },
    { name: "min_pitch", description: "Minimum metal pitch", min: 48, layer: "M1" },
    { name: "min_spacing", description: "Minimum metal spacing", min: 24, layer: "M1" },
    { name: "min_area", description: "Minimum metal area", min: 120, layer: "M1" },
    { name: "min_via_size", description: "Minimum via size", min: 20, layer: "V0" },
  ],
  illumination: {
    wavelength: 13.5,
    na: 0.55,
    sigma: 0.75,
    polarization: "dipole",
  },
  resist: {
    type: "CAR",
    thickness: 35,
    sensitivity: 55,
  },
};

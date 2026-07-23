export const Intel18A = {
    name: "Intel 18A",
    node: "18A",
    vendor: "Intel Foundry",
    version: "1.0",
    layers: [
        { name: "Poly", type: "poly", minWidth: 18, minPitch: 48, minSpacing: 16, opacity: 1.0 },
        { name: "M1", type: "metal", minWidth: 21, minPitch: 42, minSpacing: 18, opacity: 0.8 },
        { name: "M2", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 20, opacity: 0.8 },
        { name: "M3", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.8 },
        { name: "V0", type: "via", minWidth: 20, minPitch: 42, minSpacing: 18, opacity: 0.6 },
    ],
    opcRules: [
        { layer: "Poly", type: "model_based", aggressiveness: 0.9, maxIterations: 15, convergenceThreshold: 0.5 },
        { layer: "M1", type: "model_based", aggressiveness: 0.8, maxIterations: 12, convergenceThreshold: 0.8 },
        { layer: "M2", type: "rule_based", aggressiveness: 0.7, maxIterations: 10, convergenceThreshold: 1.0 },
    ],
    designRules: [
        { name: "min_width", description: "Minimum metal width", min: 21, layer: "M1" },
        { name: "min_pitch", description: "Minimum metal pitch", min: 42, layer: "M1" },
        { name: "min_spacing", description: "Minimum spacing", min: 16, layer: "Poly" },
        { name: "min_via_size", description: "Minimum via size", min: 20, layer: "V0" },
    ],
    illumination: { wavelength: 13.5, na: 0.55, sigma: 0.85, polarization: "quadrupole" },
    resist: { type: "EUV_positive", thickness: 30, sensitivity: 40 },
};
//# sourceMappingURL=intel-18a.js.map
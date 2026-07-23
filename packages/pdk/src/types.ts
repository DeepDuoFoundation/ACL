export interface ProcessLayer {
  name: string;
  type: "metal" | "via" | "poly" | "diffusion" | "well";
  minWidth: number;
  minPitch: number;
  minSpacing: number;
  opacity: number;
}

export interface OPCRule {
  layer: string;
  type: "rule_based" | "model_based" | "ilt";
  aggressiveness: number;
  maxIterations: number;
  convergenceThreshold: number;
}

export interface DesignRule {
  name: string;
  description: string;
  min: number;
  max?: number;
  layer?: string;
}

export interface PDKConfig {
  name: string;
  node: string;
  vendor: string;
  version: string;
  layers: ProcessLayer[];
  opcRules: OPCRule[];
  designRules: DesignRule[];
  illumination: {
    wavelength: number;
    na: number;
    sigma: number;
    polarization: string;
  };
  resist: {
    type: string;
    thickness: number;
    sensitivity: number;
  };
}

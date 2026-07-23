export interface MaskPattern {
  layer: string;
  polygons: Array<{ x: number; y: number; width: number; height: number }>;
  pitch: number;
  mpc?: number;
}

export interface OPCResult {
  correctedMask: MaskPattern;
  correctionTime: number;
  iterationCount: number;
  convergence: boolean;
}

export interface ILTResult {
  optimalMask: MaskPattern;
  synthesisTime: number;
  iterations: number;
  costFunction: number;
}

export interface SimulationResult {
  aerialImage: number[][];
  resistImage: number[][];
  epe: number[];
  cd: number[];
}

export interface PipelineConfig {
  mode: "fast" | "accurate" | "hybrid";
  maxIterations: number;
  convergenceThreshold: number;
  useGPU: boolean;
  pdk: string;
}

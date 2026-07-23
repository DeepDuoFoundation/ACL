export interface GPUCluster {
  nodes: GPUNode[];
  interconnect: "xgmi" | "pcie" | "mixed";
  totalGpus: number;
}

export interface GPUNode {
  nodeId: string;
  hostname: string;
  gpus: GPUDevice[];
  cpuCores: number;
  ramGB: number;
}

export interface GPUDevice {
  gpuId: string;
  model: string;
  memoryGB: number;
  utilisation: number;
  temperature: number;
  currentJob?: string;
}

export interface JobSpec {
  jobId: string;
  type: "correction" | "simulation" | "training" | "calibration";
  priority: number;
  estimatedRuntimeMs: number;
  memoryRequirementGB: number;
  gpuCount: number;
  inputPaths: string[];
  outputPaths: string[];
}

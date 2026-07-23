export interface DashboardConfig {
  refreshInterval: number;
  maxDataPoints: number;
  enableRealTime: boolean;
}

export interface EPEData {
  timestamp: number;
  layer: string;
  epeMap: number[][];
  maxEPE: number;
  avgEPE: number;
  rmsEPE: number;
  histogram: number[];
}

export interface JobStatus {
  id: string;
  name: string;
  status: "queued" | "running" | "completed" | "failed" | "paused";
  progress: number;
  startTime: number;
  estimatedCompletion?: number;
  agentId: string;
  metrics?: Record<string, number>;
}

export interface MetricsData {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  avgRuntime: number;
  gpuUtilization: number;
  memoryUsage: number;
  activeAgents: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface RunOPCRequest {
  jobId: string;
  layoutPath: string;
  pdkName: string;
  options?: Record<string, unknown>;
}

export interface RCARequest {
  jobId: string;
  failureLayer: string;
  symptomDetails: Record<string, unknown>;
}

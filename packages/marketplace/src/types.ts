export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: "agent" | "simulator" | "connector" | "visualization";
  certified: boolean;
  signature?: string;
  publishedAt: number;
  updatedAt: number;
}

export interface PluginVersion {
  version: string;
  tarballHash: string;
  signature: string;
  publishedAt: number;
  minPlatformVersion: string;
}

export interface SandboxConfig {
  enabled: boolean;
  networkAccess: boolean;
  filesystemAccess: "none" | "read-only" | "read-write";
  maxMemoryMb: number;
  maxCpuTimeMs: number;
}

export interface AuditEntry {
  pluginId: string;
  action: "install" | "update" | "remove" | "execute";
  timestamp: number;
  userId: string;
  result: "success" | "failure";
  details?: string;
}

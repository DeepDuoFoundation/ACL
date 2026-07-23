import type { JobVersion, CollaborationConfig } from "./types.js";

export class VersionControl {
  private versions = new Map<string, JobVersion[]>();
  private config: CollaborationConfig;

  constructor(config: CollaborationConfig) {
    this.config = config;
  }

  async createVersion(jobId: string, author: string, description: string, data: Record<string, unknown>): Promise<JobVersion> {
    const existing = this.versions.get(jobId) ?? [];
    const version: JobVersion = {
      id: `ver-${Date.now()}`,
      jobId,
      version: existing.length + 1,
      author,
      description,
      data,
      parentVersion: existing.length > 0 ? existing[existing.length - 1].id : undefined,
      createdAt: Date.now(),
    };

    existing.push(version);
    this.versions.set(jobId, existing);

    return version;
  }

  async getVersion(jobId: string, versionNumber: number): Promise<JobVersion | undefined> {
    const versions = this.versions.get(jobId) ?? [];
    return versions.find((v) => v.version === versionNumber);
  }

  async getLatestVersion(jobId: string): Promise<JobVersion | undefined> {
    const versions = this.versions.get(jobId) ?? [];
    return versions[versions.length - 1];
  }

  async getVersionHistory(jobId: string): Promise<JobVersion[]> {
    return this.versions.get(jobId) ?? [];
  }

  async revertToVersion(jobId: string, versionNumber: number): Promise<JobVersion> {
    const versions = this.versions.get(jobId) ?? [];
    const targetVersion = versions.find((v) => v.version === versionNumber);
    if (!targetVersion) throw new Error("Version not found");

    return this.createVersion(jobId, targetVersion.author, `Reverted to version ${versionNumber}`, targetVersion.data);
  }

  async compareVersions(jobId: string, version1: number, version2: number): Promise<{
    version1: JobVersion;
    version2: JobVersion;
    differences: string[];
  }> {
    const v1 = await this.getVersion(jobId, version1);
    const v2 = await this.getVersion(jobId, version2);
    if (!v1 || !v2) throw new Error("Version not found");

    const differences: string[] = [];
    const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)]);
    for (const key of allKeys) {
      if (JSON.stringify(v1.data[key]) !== JSON.stringify(v2.data[key])) {
        differences.push(key);
      }
    }

    return { version1: v1, version2: v2, differences };
  }
}

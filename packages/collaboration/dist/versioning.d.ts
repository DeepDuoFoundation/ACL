import type { JobVersion, CollaborationConfig } from "./types.js";
export declare class VersionControl {
    private versions;
    private config;
    constructor(config: CollaborationConfig);
    createVersion(jobId: string, author: string, description: string, data: Record<string, unknown>): Promise<JobVersion>;
    getVersion(jobId: string, versionNumber: number): Promise<JobVersion | undefined>;
    getLatestVersion(jobId: string): Promise<JobVersion | undefined>;
    getVersionHistory(jobId: string): Promise<JobVersion[]>;
    revertToVersion(jobId: string, versionNumber: number): Promise<JobVersion>;
    compareVersions(jobId: string, version1: number, version2: number): Promise<{
        version1: JobVersion;
        version2: JobVersion;
        differences: string[];
    }>;
}
//# sourceMappingURL=versioning.d.ts.map
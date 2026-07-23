export class VersionControl {
    versions = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    async createVersion(jobId, author, description, data) {
        const existing = this.versions.get(jobId) ?? [];
        const version = {
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
    async getVersion(jobId, versionNumber) {
        const versions = this.versions.get(jobId) ?? [];
        return versions.find((v) => v.version === versionNumber);
    }
    async getLatestVersion(jobId) {
        const versions = this.versions.get(jobId) ?? [];
        return versions[versions.length - 1];
    }
    async getVersionHistory(jobId) {
        return this.versions.get(jobId) ?? [];
    }
    async revertToVersion(jobId, versionNumber) {
        const versions = this.versions.get(jobId) ?? [];
        const targetVersion = versions.find((v) => v.version === versionNumber);
        if (!targetVersion)
            throw new Error("Version not found");
        return this.createVersion(jobId, targetVersion.author, `Reverted to version ${versionNumber}`, targetVersion.data);
    }
    async compareVersions(jobId, version1, version2) {
        const v1 = await this.getVersion(jobId, version1);
        const v2 = await this.getVersion(jobId, version2);
        if (!v1 || !v2)
            throw new Error("Version not found");
        const differences = [];
        const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)]);
        for (const key of allKeys) {
            if (JSON.stringify(v1.data[key]) !== JSON.stringify(v2.data[key])) {
                differences.push(key);
            }
        }
        return { version1: v1, version2: v2, differences };
    }
}
//# sourceMappingURL=versioning.js.map
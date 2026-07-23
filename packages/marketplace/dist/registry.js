export class PluginRegistry {
    plugins = new Map();
    versions = new Map();
    registerPlugin(meta) {
        this.plugins.set(meta.id, meta);
        if (!this.versions.has(meta.id)) {
            this.versions.set(meta.id, []);
        }
    }
    getPlugin(id) {
        return this.plugins.get(id);
    }
    listPlugins(category) {
        const all = Array.from(this.plugins.values());
        if (category)
            return all.filter((p) => p.category === category);
        return all;
    }
    addVersion(pluginId, version) {
        const versions = this.versions.get(pluginId);
        if (!versions)
            throw new Error(`Plugin not found: ${pluginId}`);
        versions.push(version);
    }
    getVersions(pluginId) {
        return this.versions.get(pluginId) ?? [];
    }
    getLatestVersion(pluginId) {
        const versions = this.getVersions(pluginId);
        return versions[versions.length - 1];
    }
    search(query) {
        const lower = query.toLowerCase();
        return Array.from(this.plugins.values()).filter((p) => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower));
    }
    removePlugin(id) {
        this.versions.delete(id);
        return this.plugins.delete(id);
    }
}

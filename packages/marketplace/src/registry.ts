import type { PluginMetadata, PluginVersion } from "./types.js";

export class PluginRegistry {
  private plugins = new Map<string, PluginMetadata>();
  private versions = new Map<string, PluginVersion[]>();

  registerPlugin(meta: PluginMetadata): void {
    this.plugins.set(meta.id, meta);
    if (!this.versions.has(meta.id)) {
      this.versions.set(meta.id, []);
    }
  }

  getPlugin(id: string): PluginMetadata | undefined {
    return this.plugins.get(id);
  }

  listPlugins(category?: string): PluginMetadata[] {
    const all = Array.from(this.plugins.values());
    if (category) return all.filter((p) => p.category === category);
    return all;
  }

  addVersion(pluginId: string, version: PluginVersion): void {
    const versions = this.versions.get(pluginId);
    if (!versions) throw new Error(`Plugin not found: ${pluginId}`);
    versions.push(version);
  }

  getVersions(pluginId: string): PluginVersion[] {
    return this.versions.get(pluginId) ?? [];
  }

  getLatestVersion(pluginId: string): PluginVersion | undefined {
    const versions = this.getVersions(pluginId);
    return versions[versions.length - 1];
  }

  search(query: string): PluginMetadata[] {
    const lower = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(
      (p) => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower)
    );
  }

  removePlugin(id: string): boolean {
    this.versions.delete(id);
    return this.plugins.delete(id);
  }
}

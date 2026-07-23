import type { PluginMetadata, PluginVersion } from "./types.js";
export declare class PluginRegistry {
    private plugins;
    private versions;
    registerPlugin(meta: PluginMetadata): void;
    getPlugin(id: string): PluginMetadata | undefined;
    listPlugins(category?: string): PluginMetadata[];
    addVersion(pluginId: string, version: PluginVersion): void;
    getVersions(pluginId: string): PluginVersion[];
    getLatestVersion(pluginId: string): PluginVersion | undefined;
    search(query: string): PluginMetadata[];
    removePlugin(id: string): boolean;
}

import type { PluginMetadata, PluginVersion } from "./types.js";
export declare class SigningVerifier {
    verifyPlugin(meta: PluginMetadata): {
        valid: boolean;
        reason?: string;
    };
    verifyVersion(version: PluginVersion): {
        valid: boolean;
        reason?: string;
    };
    verifyIntegrity(plugin: PluginMetadata, version: PluginVersion): {
        valid: boolean;
        errors: string[];
    };
}

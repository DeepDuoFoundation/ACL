import type { PluginMetadata, PluginVersion } from "./types.js";

export class SigningVerifier {
  verifyPlugin(meta: PluginMetadata): { valid: boolean; reason?: string } {
    if (!meta.certified) {
      return { valid: false, reason: "Plugin is not certified" };
    }
    if (!meta.signature) {
      return { valid: false, reason: "Missing signature" };
    }
    return { valid: true };
  }

  verifyVersion(version: PluginVersion): { valid: boolean; reason?: string } {
    if (!version.signature) {
      return { valid: false, reason: "Missing version signature" };
    }
    if (!version.tarballHash) {
      return { valid: false, reason: "Missing tarball hash" };
    }
    return { valid: true };
  }

  verifyIntegrity(plugin: PluginMetadata, version: PluginVersion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const pluginCheck = this.verifyPlugin(plugin);
    if (!pluginCheck.valid) errors.push(pluginCheck.reason!);
    const versionCheck = this.verifyVersion(version);
    if (!versionCheck.valid) errors.push(versionCheck.reason!);
    return { valid: errors.length === 0, errors };
  }
}

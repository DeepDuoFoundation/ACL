export class SigningVerifier {
    verifyPlugin(meta) {
        if (!meta.certified) {
            return { valid: false, reason: "Plugin is not certified" };
        }
        if (!meta.signature) {
            return { valid: false, reason: "Missing signature" };
        }
        return { valid: true };
    }
    verifyVersion(version) {
        if (!version.signature) {
            return { valid: false, reason: "Missing version signature" };
        }
        if (!version.tarballHash) {
            return { valid: false, reason: "Missing tarball hash" };
        }
        return { valid: true };
    }
    verifyIntegrity(plugin, version) {
        const errors = [];
        const pluginCheck = this.verifyPlugin(plugin);
        if (!pluginCheck.valid)
            errors.push(pluginCheck.reason);
        const versionCheck = this.verifyVersion(version);
        if (!versionCheck.valid)
            errors.push(versionCheck.reason);
        return { valid: errors.length === 0, errors };
    }
}

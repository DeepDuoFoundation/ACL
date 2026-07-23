import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PROVIDERS } from "./catalog.js";
export function getProvider(id) {
    return PROVIDERS[id];
}
export function resolveEndpoint(spec) {
    const parts = spec.split("/");
    const providerId = parts[0] ?? "vllm";
    const model = parts.slice(1).join("/") || undefined;
    const def = PROVIDERS[providerId];
    if (!def) {
        throw new Error(`Unknown provider: ${providerId}`);
    }
    const baseURL = def.baseURL ?? "http://localhost:8000/v1";
    const apiKey = def.apiKeyEnv ? process.env[def.apiKeyEnv] : undefined;
    return {
        baseURL,
        apiKey,
        model: model ?? "",
        providerId,
        compat: def.compat,
    };
}
export function loadKayartConfig(cwd) {
    try {
        const configPath = resolve(cwd ?? process.cwd(), "kayart.json");
        const raw = readFileSync(configPath, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function resolveSpec(opts) {
    if (opts?.provider && opts.model)
        return `${opts.provider}/${opts.model}`;
    if (opts?.provider)
        return opts.provider;
    if (process.env.IA_PROVIDER_MODEL)
        return process.env.IA_PROVIDER_MODEL;
    const kc = loadKayartConfig();
    if (kc?.provider && kc.model)
        return `${kc.provider}/${kc.model}`;
    return undefined;
}
//# sourceMappingURL=resolver.js.map
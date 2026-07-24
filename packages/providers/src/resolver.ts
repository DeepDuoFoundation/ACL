import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ProviderDef, EndpointResult, KayartConfig } from "./types.js";
import { PROVIDERS } from "./catalog.js";
import { checkProviderAccess } from "./tier-gate.js";

export function getProvider(id: string): ProviderDef | undefined {
  return PROVIDERS[id];
}

async function detectTierFromKey(apiKey: string): Promise<"free" | "pro" | "enterprise"> {
  const match = apiKey.match(/^ddf-(free|pro|enterprise)-/);
  if (match) return match[1] as "free" | "pro" | "enterprise";
  return "free";
}

export async function resolveEndpoint(spec: string, apiKey?: string): Promise<EndpointResult> {
  const parts = spec.split("/");
  const providerId = parts[0] ?? "vllm";
  const model = parts.slice(1).join("/") || undefined;

  const def = PROVIDERS[providerId];
  if (!def) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  const effectiveKey = apiKey || (def.apiKeyEnv ? process.env[def.apiKeyEnv] : undefined);
  if (effectiveKey) {
    const tier = await detectTierFromKey(effectiveKey);
    checkProviderAccess(providerId, tier);
  }

  const baseURL = def.baseURL ?? "http://localhost:8000/v1";

  return {
    baseURL,
    apiKey: effectiveKey,
    model: model ?? "",
    providerId,
    compat: def.compat,
  };
}

export function loadKayartConfig(cwd?: string): KayartConfig | null {
  try {
    const configPath = resolve(cwd ?? process.cwd(), "kayart.json");
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as KayartConfig;
  } catch {
    return null;
  }
}

export function resolveSpec(opts?: { provider?: string; model?: string }): string | undefined {
  if (opts?.provider && opts.model) return `${opts.provider}/${opts.model}`;
  if (opts?.provider) return opts.provider;
  if (process.env.IA_PROVIDER_MODEL) return process.env.IA_PROVIDER_MODEL;
  const kc = loadKayartConfig();
  if (kc?.provider && kc.model) return `${kc.provider}/${kc.model}`;
  return undefined;
}

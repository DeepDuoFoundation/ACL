import type { ProviderDef } from "./types.js";

type Tier = "free" | "pro" | "enterprise";

export function filterProvidersByTier(providers: Record<string, ProviderDef>, tier: Tier): Record<string, ProviderDef> {
  const filtered: Record<string, ProviderDef> = {};
  for (const [id, def] of Object.entries(providers)) {
    if (isProviderAllowedForTier(def, tier)) {
      filtered[id] = def;
    }
  }
  return filtered;
}

export function checkProviderAccess(providerId: string, tier: Tier): void {
  if (providerId === "ddf-gateway") return;
  if (tier === "enterprise") return;
  if (tier === "pro" && ["anthropic", "openai", "google", "ddf-gateway"].includes(providerId)) return;
  if (tier === "free") throw new ProviderAccessError(`Provider '${providerId}' is not available on the Free tier. Upgrade to Pro or Enterprise.`);

  throw new ProviderAccessError(`Provider '${providerId}' is not available on the ${tier} tier.`);
}

export function isProviderAllowedForTier(def: ProviderDef, tier: Tier): boolean {
  if (def.tier === "all") return true;
  if (def.tier === "pro" && (tier === "pro" || tier === "enterprise")) return true;
  return false;
}

export class ProviderAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderAccessError";
  }
}

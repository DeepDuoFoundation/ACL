export type Tier = "free" | "pro" | "enterprise";

export interface TierConfig {
  name: string;
  maxRequestsPerMin: number;
  maxTokensPerDay: number;
  allowedProviders: string[];
  features: string[];
  dataCollection: "required" | "opt-in" | "none";
  rateLimitRpm: number;
  maxStorageGb: number;
  maxTeamMembers: number;
}

export const TIER_CONFIGS: Record<Tier, TierConfig> = {
  free: {
    name: "Free",
    maxRequestsPerMin: 10,
    maxTokensPerDay: 100000,
    allowedProviders: ["ddf-gateway"],
    features: ["basic-chat", "basic-lithography"],
    dataCollection: "required",
    rateLimitRpm: 10,
    maxStorageGb: 1,
    maxTeamMembers: 1,
  },
  pro: {
    name: "Pro",
    maxRequestsPerMin: 60,
    maxTokensPerDay: 1000000,
    allowedProviders: ["ddf-gateway", "anthropic", "openai", "google"],
    features: ["*"],
    dataCollection: "opt-in",
    rateLimitRpm: 60,
    maxStorageGb: 10,
    maxTeamMembers: 5,
  },
  enterprise: {
    name: "Enterprise",
    maxRequestsPerMin: 300,
    maxTokensPerDay: 10000000,
    allowedProviders: [],
    features: ["*"],
    dataCollection: "none",
    rateLimitRpm: 300,
    maxStorageGb: 100,
    maxTeamMembers: 100,
  },
};

export class TierManager {
  static detectTier(apiKey: string): Tier {
    const match = apiKey.match(/^ddf-(free|pro|enterprise)-/);
    if (match) return match[1] as Tier;
    if (apiKey.startsWith("ddf_") || apiKey.startsWith("ddf-")) return "free";
    return "free";
  }

  static getConfig(tier: Tier): TierConfig {
    return TIER_CONFIGS[tier];
  }

  static isFeatureEnabled(tier: Tier, feature: string): boolean {
    const config = TIER_CONFIGS[tier];
    if (config.features.includes("*")) return true;
    return config.features.includes(feature);
  }

  static isProviderAllowed(tier: Tier, providerId: string): boolean {
    const config = TIER_CONFIGS[tier];
    if (config.allowedProviders.length === 0) return true;
    return config.allowedProviders.includes(providerId);
  }
}

import type { Tier } from "./tiers.js";
import { TierManager } from "./tiers.js";

interface ConsentRecord {
  userId: string;
  version: string;
  grantedAt: number;
}

export class ConsentManager {
  private records = new Map<string, ConsentRecord>();

  getConsentStatus(userId: string): boolean {
    return this.records.has(userId);
  }

  recordConsent(userId: string, version: string): void {
    this.records.set(userId, { userId, version, grantedAt: Date.now() });
  }

  revokeConsent(userId: string): void {
    this.records.delete(userId);
  }

  getCollectionMode(tier: Tier): "required" | "opt-in" | "none" {
    return TierManager.getConfig(tier).dataCollection;
  }

  isDataCollectionAllowed(tier: Tier, userId: string): boolean {
    const mode = this.getCollectionMode(tier);
    if (mode === "none") return false;
    if (mode === "required") return true;
    return this.getConsentStatus(userId);
  }
}

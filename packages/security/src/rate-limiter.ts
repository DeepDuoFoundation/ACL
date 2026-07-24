import { TierManager, type Tier } from "./tiers.js";

interface WindowEntry {
  timestamp: number;
}

export class RateLimiter {
  private windows = new Map<string, WindowEntry[]>();

  check(key: string, tier: Tier): { allowed: boolean; retryAfter?: number } {
    const config = TierManager.getConfig(tier);
    const limit = config.rateLimitRpm;
    const now = Date.now();
    const windowMs = 60_000;

    let entries = this.windows.get(key);
    if (!entries) {
      entries = [];
      this.windows.set(key, entries);
    }

    const cutoff = now - windowMs;
    const valid = entries.filter((e) => e.timestamp > cutoff);
    this.windows.set(key, valid);

    if (valid.length >= limit) {
      const oldest = valid[0];
      const retryAfter = Math.ceil((oldest.timestamp + windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    valid.push({ timestamp: now });
    return { allowed: true };
  }

  reset(key?: string): void {
    if (key) {
      this.windows.delete(key);
    } else {
      this.windows.clear();
    }
  }
}

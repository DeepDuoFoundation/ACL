import { createHash } from "node:crypto";

export interface UsageRecord {
  id: string;
  timestamp: number;
  userId: string;
  tier: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  endpoint: string;
}

const PROVIDER_RATES: Record<string, { inputPer1K: number; outputPer1K: number }> = {
  "ddf-gateway": { inputPer1K: 0.003, outputPer1K: 0.015 },
  anthropic: { inputPer1K: 0.015, outputPer1K: 0.075 },
  openai: { inputPer1K: 0.01, outputPer1K: 0.03 },
  google: { inputPer1K: 0.005, outputPer1K: 0.015 },
};

const MAX_RECORDS = 10_000;

export class UsageTracker {
  private static instance: UsageTracker;
  private records: UsageRecord[] = [];

  private constructor() {}

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  recordUsage(data: Omit<UsageRecord, "id" | "timestamp" | "cost">): UsageRecord {
    const rates = PROVIDER_RATES[data.provider] || { inputPer1K: 0.003, outputPer1K: 0.015 };
    const cost = (data.inputTokens / 1000) * rates.inputPer1K + (data.outputTokens / 1000) * rates.outputPer1K;

    const record: UsageRecord = {
      id: `usage-${Date.now()}-${createHash("md5").update(JSON.stringify(data)).digest("hex").slice(0, 8)}`,
      timestamp: Date.now(),
      cost: Math.round(cost * 100000) / 100000,
      ...data,
    };

    this.records.push(record);
    if (this.records.length > MAX_RECORDS) {
      this.records = this.records.slice(-MAX_RECORDS);
    }
    return record;
  }

  getStats(): {
    totalTokens: number;
    totalCost: number;
    totalRequests: number;
    byProvider: Record<string, { requests: number; tokens: number; cost: number }>;
    byTier: Record<string, { requests: number; tokens: number; cost: number }>;
  } {
    const byProvider: Record<string, { requests: number; tokens: number; cost: number }> = {};
    const byTier: Record<string, { requests: number; tokens: number; cost: number }> = {};
    let totalTokens = 0;
    let totalCost = 0;

    for (const r of this.records) {
      const tokens = r.inputTokens + r.outputTokens;
      totalTokens += tokens;
      totalCost += r.cost;

      if (!byProvider[r.provider]) byProvider[r.provider] = { requests: 0, tokens: 0, cost: 0 };
      byProvider[r.provider].requests++;
      byProvider[r.provider].tokens += tokens;
      byProvider[r.provider].cost += r.cost;

      if (!byTier[r.tier]) byTier[r.tier] = { requests: 0, tokens: 0, cost: 0 };
      byTier[r.tier].requests++;
      byTier[r.tier].tokens += tokens;
      byTier[r.tier].cost += r.cost;
    }

    return {
      totalTokens,
      totalCost: Math.round(totalCost * 100) / 100,
      totalRequests: this.records.length,
      byProvider,
      byTier,
    };
  }

  reset(): void {
    this.records = [];
  }
}

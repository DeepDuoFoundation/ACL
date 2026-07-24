import type { Tier } from "./tiers.js";
import { ConsentManager } from "./consent.js";

export interface TelemetryEvent {
  type: "chat" | "feedback" | "usage" | "error";
  userId: string;
  tier: Tier;
  timestamp: number;
  payload: Record<string, unknown>;
}

export class TelemetryCollector {
  private buffer: TelemetryEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushIntervalMs: number;
  private endpoint: string;
  private consentManager = new ConsentManager();

  constructor(endpoint = "https://telemetry.lithomind.ai/v1/events", flushIntervalMs = 60_000) {
    this.endpoint = endpoint;
    this.flushIntervalMs = flushIntervalMs;
  }

  start(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  track(event: Omit<TelemetryEvent, "timestamp">): void {
    const tierConfig = this.consentManager.getCollectionMode(event.tier);
    if (tierConfig === "none") return;
    if (tierConfig === "opt-in" && !this.consentManager.getConsentStatus(event.userId)) return;

    this.buffer.push({ ...event, timestamp: Date.now() });
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0);
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      this.buffer.unshift(...batch);
    }
  }

  getBufferLength(): number {
    return this.buffer.length;
  }

  flushNow(): Promise<void> {
    return this.flush();
  }
}

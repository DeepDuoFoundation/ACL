import { createHash } from "crypto";
import type { AuditEntry } from "./types.js";

export class ImmutableAuditLogger {
  private logChain: AuditEntry[] = [];
  private lastHash: string = "0000000000000000000000000000000000000000000000000000000000000000";

  log(userId: string, action: string, resourceId: string, details: Record<string, unknown> = {}): AuditEntry {
    const timestamp = Date.now();
    const id = `audit-${this.logChain.length + 1}-${timestamp}`;
    const previousHash = this.lastHash;

    const payloadString = JSON.stringify({
      id,
      timestamp,
      userId,
      action,
      resourceId,
      details,
      previousHash,
    });

    const currentHash = createHash("sha256").update(payloadString).digest("hex");

    const entry: AuditEntry = {
      id,
      timestamp,
      userId,
      action,
      resourceId,
      details,
      previousHash,
      currentHash,
    };

    this.logChain.push(entry);
    this.lastHash = currentHash;

    return entry;
  }

  getLogs(): AuditEntry[] {
    return [...this.logChain];
  }

  verifyIntegrity(): { isValid: boolean; corruptedAtIndex?: number } {
    let expectedPreviousHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < this.logChain.length; i++) {
      const entry = this.logChain[i];

      if (entry.previousHash !== expectedPreviousHash) {
        return { isValid: false, corruptedAtIndex: i };
      }

      const payloadString = JSON.stringify({
        id: entry.id,
        timestamp: entry.timestamp,
        userId: entry.userId,
        action: entry.action,
        resourceId: entry.resourceId,
        details: entry.details,
        previousHash: entry.previousHash,
      });

      const calculatedHash = createHash("sha256").update(payloadString).digest("hex");

      if (calculatedHash !== entry.currentHash) {
        return { isValid: false, corruptedAtIndex: i };
      }

      expectedPreviousHash = entry.currentHash;
    }

    return { isValid: true };
  }
}

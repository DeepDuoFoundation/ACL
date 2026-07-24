import type { Tier } from "./tiers.js";

export interface PromoCode {
  code: string;
  description: string;
  discountPercent: number;
  maxUses: number;
  currentUses: number;
  appliesToTier?: Tier;
  expiresAt?: Date;
  isActive: boolean;
}

export class PromoCodeManager {
  private promos = new Map<string, PromoCode>();

  createPromo(config: Omit<PromoCode, "currentUses" | "isActive">): void {
    this.promos.set(config.code.toUpperCase(), {
      ...config,
      currentUses: 0,
      isActive: true,
    });
  }

  validatePromo(code: string, tier: Tier): { valid: boolean; message: string; discount?: number } {
    const promo = this.promos.get(code.toUpperCase());
    if (!promo) return { valid: false, message: "Invalid promo code" };
    if (!promo.isActive) return { valid: false, message: "Promo code is no longer active" };
    if (promo.currentUses >= promo.maxUses) return { valid: false, message: "Promo code has reached maximum uses" };
    if (promo.expiresAt && new Date() > promo.expiresAt) return { valid: false, message: "Promo code has expired" };
    if (promo.appliesToTier && promo.appliesToTier !== tier) return { valid: false, message: `Promo code does not apply to ${tier} tier` };

    return { valid: true, message: "Promo code is valid", discount: promo.discountPercent };
  }

  redeemPromo(code: string): boolean {
    const promo = this.promos.get(code.toUpperCase());
    if (!promo) return false;
    promo.currentUses++;
    return true;
  }

  listPromos(): PromoCode[] {
    return Array.from(this.promos.values());
  }

  deactivatePromo(code: string): void {
    const promo = this.promos.get(code.toUpperCase());
    if (promo) promo.isActive = false;
  }
}

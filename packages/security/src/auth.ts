export interface GatewayUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthVerificationResult {
  valid: boolean;
  user?: GatewayUser;
  error?: string;
}

export class GatewayAuthClient {
  constructor(private gatewayUrl: string = process.env.DDF_GATEWAY_URL || "https://aiback.ddfrl.com/v1") {}

  async verifyToken(token: string, product = "agentic-lithography"): Promise<AuthVerificationResult> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/auth/keys/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-DDF-Product": product,
        },
      });

      if (!resp.ok) {
        return { valid: false, error: `Gateway auth failed with status ${resp.status}` };
      }

      const data = (await resp.json()) as any;
      if (data.valid === false) {
        return { valid: false, error: "Invalid token" };
      }
      return {
        valid: true,
        user: data.user || { id: data.userId || "usr_gateway", email: data.email || "user@ddf.ai" },
      };
    } catch (err) {
      return { valid: false, error: (err as Error).message };
    }
  }

  async verifyApiKey(apiKey: string, product = "agentic-lithography"): Promise<AuthVerificationResult> {
    try {
      const resp = await fetch(`${this.gatewayUrl}/auth/keys/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-DDF-Product": product,
        },
        body: JSON.stringify({ key: apiKey }),
      });

      if (!resp.ok) {
        return { valid: false, error: `Invalid API key (${resp.status})` };
      }

      const data = (await resp.json()) as any;
      if (data.valid === false) {
        return { valid: false, error: "Invalid API key" };
      }
      return { valid: true, user: data.user };
    } catch (err) {
      return { valid: false, error: (err as Error).message };
    }
  }
}

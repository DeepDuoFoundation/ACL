import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import type { EncryptionResult } from "./types.js";

export class AES256Encryptor {
  private key: Buffer;

  constructor(secretKey?: string) {
    if (secretKey) {
      // Key must be 32 bytes for AES-256
      this.key = Buffer.alloc(32);
      const buf = Buffer.from(secretKey, "utf-8");
      buf.copy(this.key, 0, 0, Math.min(buf.length, 32));
    } else {
      this.key = randomBytes(32);
    }
  }

  encrypt(plaintext: string): EncryptionResult {
    const iv = randomBytes(12); // Recommended IV length for GCM is 12 bytes
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return {
      encryptedData: encrypted,
      iv: iv.toString("hex"),
      authTag,
    };
  }

  decrypt(result: EncryptionResult): string {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.key,
      Buffer.from(result.iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(result.authTag, "hex"));

    let decrypted = decipher.update(result.encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

import { describe, it, expect } from "vitest";
import { AES256Encryptor } from "../src/encryption.js";
import { ImmutableAuditLogger } from "../src/audit-logger.js";
import { RBACManager } from "../src/rbac.js";

describe("Security Package (@litho/security)", () => {
  describe("AES256Encryptor", () => {
    it("encrypts and decrypts text successfully", () => {
      const encryptor = new AES256Encryptor("secret-key-12345");
      const plaintext = "Top Secret GDSII Mask Layout Data";

      const encrypted = encryptor.encrypt(plaintext);
      expect(encrypted.encryptedData).not.toBe(plaintext);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      const decrypted = encryptor.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe("ImmutableAuditLogger", () => {
    it("creates hash-chained log entries and verifies integrity", () => {
      const logger = new ImmutableAuditLogger();

      logger.log("user-1", "execute:opc", "job-101", { pdk: "tsmc-n3e" });
      logger.log("user-2", "approve:hitl", "job-101", { decision: "approved" });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[1].previousHash).toBe(logs[0].currentHash);

      const integrity = logger.verifyIntegrity();
      expect(integrity.isValid).toBe(true);
    });

    it("detects tampered log entries", () => {
      const logger = new ImmutableAuditLogger();

      logger.log("user-1", "execute:opc", "job-101");
      logger.log("user-2", "release:mask", "job-101");

      const logs = logger.getLogs();
      // Tamper with action
      logs[0].action = "tampered:action";

      const integrity = logger.verifyIntegrity();
      expect(integrity.isValid).toBe(false);
      expect(integrity.corruptedAtIndex).toBe(0);
    });
  });

  describe("RBACManager", () => {
    it("correctly evaluates role permissions", () => {
      const rbac = new RBACManager();

      expect(rbac.hasPermission("Admin", "admin:workspace")).toBe(true);
      expect(rbac.hasPermission("LithoEngineer", "execute:opc")).toBe(true);
      expect(rbac.hasPermission("LithoEngineer", "admin:workspace")).toBe(false);
      expect(rbac.hasPermission("Viewer", "write:layout")).toBe(false);
      expect(rbac.hasPermission("Viewer", "read:layout")).toBe(true);
    });
  });
});

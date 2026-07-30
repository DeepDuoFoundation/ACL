import { describe, it, expect, beforeEach } from "vitest";
import { AES256Encryptor } from "../encryption.js";
import { RBACManager } from "../rbac.js";
import { ImmutableAuditLogger } from "../audit-logger.js";
import { VaultSecrets } from "../vault-secrets.js";
import type { RBACRole, PermissionScope } from "../types.js";

describe("AES-256 encryption/decryption", () => {
  it("encrypts and decrypts plaintext", () => {
    const encryptor = new AES256Encryptor("test-secret-key-32-bytes-long!");
    const plaintext = "LithoMind EUV simulation data";

    const encrypted = encryptor.encrypt(plaintext);
    expect(encrypted.encryptedData).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.authTag).toBeTruthy();
    expect(encrypted.encryptedData).not.toBe(plaintext);

    const decrypted = encryptor.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext for same plaintext (random IV)", () => {
    const encryptor = new AES256Encryptor("test-key-32-bytes-for-aes256!");
    const plaintext = "same input";

    const enc1 = encryptor.encrypt(plaintext);
    const enc2 = encryptor.encrypt(plaintext);

    expect(enc1.encryptedData).not.toBe(enc2.encryptedData);
    expect(enc1.iv).not.toBe(enc2.iv);
  });

  it("fails to decrypt with wrong key", () => {
    const encryptor1 = new AES256Encryptor("correct-key-32-bytes-for-test!");
    const encryptor2 = new AES256Encryptor("wrong-key-32-bytes-for-test!!");

    const encrypted = encryptor1.encrypt("secret");
    expect(() => encryptor2.decrypt(encrypted)).toThrow();
  });

  it("handles empty string", () => {
    const encryptor = new AES256Encryptor();
    const encrypted = encryptor.encrypt("");
    expect(encryptor.decrypt(encrypted)).toBe("");
  });

  it("handles unicode content", () => {
    const encryptor = new AES256Encryptor("unicode-key-32-bytes-for-test!");
    const plaintext = "EUV 13.5nm EUV lithography — 高NA";
    const encrypted = encryptor.encrypt(plaintext);
    expect(encryptor.decrypt(encrypted)).toBe(plaintext);
  });
});

describe("RBAC permission checks", () => {
  let rbac: RBACManager;

  beforeEach(() => {
    rbac = new RBACManager();
  });

  const allRoles: RBACRole[] = ["Admin", "LithoEngineer", "YieldEngineer", "Manager", "Viewer", "FoundryGuest"];
  const allPermissions: PermissionScope[] = [
    "read:layout", "write:layout", "execute:opc", "release:mask",
    "read:kg", "write:kg", "trigger:rca", "approve:hitl", "admin:workspace",
  ];

  it("Admin has all permissions", () => {
    for (const perm of allPermissions) {
      expect(rbac.hasPermission("Admin", perm)).toBe(true);
    }
  });

  it("LithoEngineer has most permissions except release and admin", () => {
    expect(rbac.hasPermission("LithoEngineer", "execute:opc")).toBe(true);
    expect(rbac.hasPermission("LithoEngineer", "read:layout")).toBe(true);
    expect(rbac.hasPermission("LithoEngineer", "release:mask")).toBe(false);
    expect(rbac.hasPermission("LithoEngineer", "admin:workspace")).toBe(false);
  });

  it("YieldEngineer has limited permissions", () => {
    expect(rbac.hasPermission("YieldEngineer", "read:layout")).toBe(true);
    expect(rbac.hasPermission("YieldEngineer", "trigger:rca")).toBe(true);
    expect(rbac.hasPermission("YieldEngineer", "write:layout")).toBe(false);
    expect(rbac.hasPermission("YieldEngineer", "execute:opc")).toBe(false);
  });

  it("Manager can release masks", () => {
    expect(rbac.hasPermission("Manager", "release:mask")).toBe(true);
    expect(rbac.hasPermission("Manager", "approve:hitl")).toBe(true);
    expect(rbac.hasPermission("Manager", "write:layout")).toBe(false);
  });

  it("Viewer can only read", () => {
    expect(rbac.hasPermission("Viewer", "read:layout")).toBe(true);
    expect(rbac.hasPermission("Viewer", "read:kg")).toBe(true);
    expect(rbac.hasPermission("Viewer", "write:layout")).toBe(false);
    expect(rbac.hasPermission("Viewer", "execute:opc")).toBe(false);
  });

  it("FoundryGuest has minimal permissions", () => {
    expect(rbac.hasPermission("FoundryGuest", "read:layout")).toBe(true);
    expect(rbac.hasPermission("FoundryGuest", "read:kg")).toBe(false);
    expect(rbac.hasPermission("FoundryGuest", "write:layout")).toBe(false);
  });

  it("getPermissions returns correct list", () => {
    const adminPerms = rbac.getPermissions("Admin");
    expect(adminPerms).toHaveLength(9);
    expect(adminPerms).toContain("admin:workspace");
  });
});

describe("ImmutableAuditLogger — hash chain integrity", () => {
  let logger: ImmutableAuditLogger;

  beforeEach(() => {
    logger = new ImmutableAuditLogger({ persistentStorage: false });
  });

  it("logs entries with hash chaining", () => {
    const entry1 = logger.log("user1", "read", "layout-1");
    const entry2 = logger.log("user2", "write", "layout-1");

    expect(entry1.previousHash).toBe("0".repeat(64));
    expect(entry1.currentHash).toBeTruthy();
    expect(entry2.previousHash).toBe(entry1.currentHash);
    expect(logger.getCount()).toBe(2);
  });

  it("verifies integrity on clean chain", () => {
    logger.log("user1", "read", "resource-1");
    logger.log("user2", "write", "resource-2");
    logger.log("user1", "delete", "resource-1");

    const result = logger.verifyIntegrity();
    expect(result.isValid).toBe(true);
    expect(result.message).toContain("all hashes valid");
  });

  it("detects tampering", () => {
    logger.log("user1", "read", "resource-1");
    logger.log("user2", "write", "resource-2");

    // Tamper with entry
    const logs = logger.getLogs();
    (logs[1] as unknown as Record<string, unknown>).action = "TAMPERED";

    const result = logger.verifyIntegrity();
    expect(result.isValid).toBe(false);
    expect(result.corruptedAtIndex).toBe(1);
  });

  it("queries entries by user", () => {
    logger.log("alice", "read", "r1");
    logger.log("bob", "write", "r2");
    logger.log("alice", "read", "r3");

    const aliceLogs = logger.query({ userId: "alice" });
    expect(aliceLogs).toHaveLength(2);
  });

  it("queries entries by action", () => {
    logger.log("u1", "read", "r1");
    logger.log("u2", "write", "r2");
    logger.log("u3", "read", "r3");

    const readLogs = logger.query({ action: "read" });
    expect(readLogs).toHaveLength(2);
  });

  it("generates compliance report", () => {
    logger.log("u1", "read", "r1");
    logger.log("u1", "write", "r1");
    logger.log("u2", "read", "r2");

    const report = logger.generateComplianceReport();
    expect(report.totalEvents).toBe(3);
    expect(report.eventsByAction["read"]).toBe(2);
    expect(report.eventsByAction["write"]).toBe(1);
    expect(report.integrityStatus).toBe("valid");
    expect(report.summary).toContain("SOC 2");
  });

  it("exports for SIEM in CSV format", () => {
    logger.log("u1", "read", "r1");
    const csv = logger.exportForSIEM("csv");
    expect(csv).toContain("id,timestamp,userId,action,resourceId");
    expect(csv).toContain("u1");
  });

  it("exports for SIEM in JSON format", () => {
    logger.log("u1", "read", "r1");
    const json = logger.exportForSIEM("json");
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });
});

describe("VaultSecrets — store, retrieve, rotate", () => {
  let vault: VaultSecrets;

  beforeEach(() => {
    vault = new VaultSecrets({ passphrase: "test-passphrase-for-vault", autoExpiryCheckIntervalMs: 60000 });
  });

  it("stores and retrieves a secret", () => {
    vault.store("api-key", "sk-12345", { owner: "alice", tags: ["api"] });
    const value = vault.retrieve("api-key", "bob");
    expect(value).toBe("sk-12345");
  });

  it("returns null for nonexistent key", () => {
    const value = vault.retrieve("ghost", "user");
    expect(value).toBeNull();
  });

  it("rotates a secret", () => {
    vault.store("api-key", "old-value", { owner: "alice", tags: [] });

    const rotated = vault.rotate("api-key", "new-value", "alice");
    expect(rotated).toBe(true);

    const value = vault.retrieve("api-key", "alice");
    expect(value).toBe("new-value");
  });

  it("rotate returns false for nonexistent key", () => {
    expect(vault.rotate("ghost", "val", "user")).toBe(false);
  });

  it("deletes a secret", () => {
    vault.store("key1", "value1", { owner: "u1", tags: [] });
    expect(vault.delete("key1", "u1")).toBe(true);
    expect(vault.retrieve("key1", "u1")).toBeNull();
  });

  it("lists secrets with pattern filter", () => {
    vault.store("api-key", "v1", { owner: "u1", tags: [] });
    vault.store("api-secret", "v2", { owner: "u1", tags: [] });
    vault.store("db-password", "v3", { owner: "u1", tags: [] });

    const apiSecrets = vault.list("^api");
    expect(apiSecrets).toHaveLength(2);
  });

  it("records audit trail", () => {
    vault.store("key1", "value1", { owner: "u1", tags: [] });
    vault.retrieve("key1", "u2");

    const audit = vault.audit("key1");
    expect(audit).toHaveLength(2);
    expect(audit[0].action).toBe("store");
    expect(audit[1].action).toBe("retrieve");
  });

  it("exports and imports vault", () => {
    vault.store("key1", "value1", { owner: "u1", tags: ["test"] });
    vault.store("key2", "value2", { owner: "u2", tags: [] });

    const exported = vault.export();
    const imported = VaultSecrets.prototype.import;
    // Create a new vault and import
    const vault2 = new VaultSecrets({ passphrase: "test-passphrase-for-vault" });
    const count = vault2.import(exported, "admin");
    expect(count).toBe(2);
  });

  it("cleans up on destroy", () => {
    vault.store("key1", "v1", { owner: "u1", tags: [] });
    vault.destroy();
    expect(vault.list()).toHaveLength(0);
  });
});

describe("GatewayAuthClient", () => {
  it("has generateDeviceCode method", async () => {
    const { GatewayAuthClient } = await import("../auth.js");
    const gw = new GatewayAuthClient("http://localhost:9999");
    expect(typeof gw.generateDeviceCode).toBe("function");
  });

  it("has verifyDeviceCode method", async () => {
    const { GatewayAuthClient } = await import("../auth.js");
    const gw = new GatewayAuthClient("http://localhost:9999");
    expect(typeof gw.verifyDeviceCode).toBe("function");
  });

  it("generateDeviceCode returns code and state", async () => {
    const { GatewayAuthClient } = await import("../auth.js");
    const gw = new GatewayAuthClient("http://localhost:9999");
    const dc = await gw.generateDeviceCode("usr_1", "test@ddf.ai", "free", [], []);
    expect(dc.code).toMatch(/^\d{6}$/);
    expect(dc.state).toBeTruthy();
    expect(dc.expiresAt).toBeGreaterThan(Date.now());
  });

  it("generateDeviceCode respects tier", async () => {
    const { GatewayAuthClient } = await import("../auth.js");
    const gw = new GatewayAuthClient("http://localhost:9999");
    const dc = await gw.generateDeviceCode("usr_1", "test@ddf.ai", "pro", ["read:layout"], ["anthropic"]);
    expect(dc.tier).toBe("pro");
    expect(dc.scopes).toContain("read:layout");
    expect(dc.allowedProviders).toContain("anthropic");
  });
});

describe("AuthFlow", () => {
  it("can be instantiated", async () => {
    const { AuthFlow } = await import("../auth-flow.js");
    const flow = new AuthFlow({ configDir: "/tmp/litho-test-auth" });
    expect(flow).toBeDefined();
    expect(typeof flow.validateApiKey).toBe("function");
    expect(typeof flow.checkSession).toBe("function");
    expect(typeof flow.logout).toBe("function");
  });

  it("checkSession returns null when no key stored", async () => {
    const { AuthFlow } = await import("../auth-flow.js");
    const flow = new AuthFlow({ configDir: "/tmp/litho-test-auth-empty" });
    const session = await flow.checkSession();
    expect(session).toBeNull();
  });

  it("validateApiKey returns error for invalid key", async () => {
    const { AuthFlow } = await import("../auth-flow.js");
    const flow = new AuthFlow({ configDir: "/tmp/litho-test-auth-invalid" });
    const result = await flow.validateApiKey("invalid-key-12345");
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("logout clears session", async () => {
    const { AuthFlow } = await import("../auth-flow.js");
    const flow = new AuthFlow({ configDir: "/tmp/litho-test-auth-logout" });
    await flow.logout();
    const session = await flow.checkSession();
    expect(session).toBeNull();
  });

  it("getAuthContext returns unauthenticated when no key", async () => {
    const { AuthFlow } = await import("../auth-flow.js");
    const flow = new AuthFlow({ configDir: "/tmp/litho-test-auth-ctx" });
    const ctx = await flow.getAuthContext();
    expect(ctx.authenticated).toBe(false);
  });
});

export type RBACRole =
  | "Admin"
  | "LithoEngineer"
  | "YieldEngineer"
  | "Manager"
  | "Viewer"
  | "FoundryGuest";

export type PermissionScope =
  | "read:layout"
  | "write:layout"
  | "execute:opc"
  | "release:mask"
  | "read:kg"
  | "write:kg"
  | "trigger:rca"
  | "approve:hitl"
  | "admin:workspace";

export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  resourceId: string;
  details: Record<string, unknown>;
  previousHash: string;
  currentHash: string;
}

export interface EncryptionResult {
  encryptedData: string; // Hex string
  iv: string;            // Hex string
  authTag: string;       // Hex string
}

import type { RBACRole, PermissionScope } from "./types.js";

const ROLE_PERMISSIONS: Record<RBACRole, PermissionScope[]> = {
  Admin: [
    "read:layout",
    "write:layout",
    "execute:opc",
    "release:mask",
    "read:kg",
    "write:kg",
    "trigger:rca",
    "approve:hitl",
    "admin:workspace",
  ],
  LithoEngineer: [
    "read:layout",
    "write:layout",
    "execute:opc",
    "read:kg",
    "write:kg",
    "trigger:rca",
    "approve:hitl",
  ],
  YieldEngineer: [
    "read:layout",
    "read:kg",
    "trigger:rca",
  ],
  Manager: [
    "read:layout",
    "release:mask",
    "read:kg",
    "approve:hitl",
  ],
  Viewer: [
    "read:layout",
    "read:kg",
  ],
  FoundryGuest: [
    "read:layout",
  ],
};

export class RBACManager {
  hasPermission(role: RBACRole, permission: PermissionScope): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  getPermissions(role: RBACRole): PermissionScope[] {
    return [...(ROLE_PERMISSIONS[role] || [])];
  }
}

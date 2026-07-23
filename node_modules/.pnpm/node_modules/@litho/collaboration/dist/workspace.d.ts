import type { Workspace, WorkspaceMember, MemberRole, CollaborationConfig } from "./types.js";
export declare class WorkspaceManager {
    private workspaces;
    private config;
    constructor(config: CollaborationConfig);
    createWorkspace(name: string, description: string, ownerId: string): Promise<Workspace>;
    getWorkspace(id: string): Promise<Workspace | undefined>;
    listWorkspaces(userId: string): Promise<Workspace[]>;
    addMember(workspaceId: string, member: Omit<WorkspaceMember, "joinedAt">): Promise<WorkspaceMember>;
    removeMember(workspaceId: string, userId: string): Promise<void>;
    updateMemberRole(workspaceId: string, userId: string, role: MemberRole): Promise<void>;
    getMembers(workspaceId: string): Promise<WorkspaceMember[]>;
}
//# sourceMappingURL=workspace.d.ts.map
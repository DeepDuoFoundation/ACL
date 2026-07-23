import type { Workspace, WorkspaceMember, MemberRole, CollaborationConfig } from "./types.js";

export class WorkspaceManager {
  private workspaces = new Map<string, Workspace>();
  private config: CollaborationConfig;

  constructor(config: CollaborationConfig) {
    this.config = config;
  }

  async createWorkspace(name: string, description: string, ownerId: string): Promise<Workspace> {
    const workspace: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      description,
      ownerId,
      members: [{
        userId: ownerId,
        name: "Owner",
        email: "",
        role: "owner",
        joinedAt: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }

  async listWorkspaces(userId: string): Promise<Workspace[]> {
    return Array.from(this.workspaces.values()).filter((w) =>
      w.members.some((m) => m.userId === userId)
    );
  }

  async addMember(workspaceId: string, member: Omit<WorkspaceMember, "joinedAt">): Promise<WorkspaceMember> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.members.length >= this.config.maxMembersPerWorkspace) {
      throw new Error("Max members reached");
    }

    const existing = workspace.members.find((m) => m.userId === member.userId);
    if (existing) throw new Error("Member already exists");

    const newMember: WorkspaceMember = { ...member, joinedAt: Date.now() };
    workspace.members.push(newMember);
    workspace.updatedAt = Date.now();

    return newMember;
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    workspace.members = workspace.members.filter((m) => m.userId !== userId);
    workspace.updatedAt = Date.now();
  }

  async updateMemberRole(workspaceId: string, userId: string, role: MemberRole): Promise<void> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const member = workspace.members.find((m) => m.userId === userId);
    if (!member) throw new Error("Member not found");

    member.role = role;
    workspace.updatedAt = Date.now();
  }

  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) throw new Error("Workspace not found");
    return workspace.members;
  }
}

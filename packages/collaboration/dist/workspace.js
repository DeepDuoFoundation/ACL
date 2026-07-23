export class WorkspaceManager {
    workspaces = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    async createWorkspace(name, description, ownerId) {
        const workspace = {
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
    async getWorkspace(id) {
        return this.workspaces.get(id);
    }
    async listWorkspaces(userId) {
        return Array.from(this.workspaces.values()).filter((w) => w.members.some((m) => m.userId === userId));
    }
    async addMember(workspaceId, member) {
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace)
            throw new Error("Workspace not found");
        if (workspace.members.length >= this.config.maxMembersPerWorkspace) {
            throw new Error("Max members reached");
        }
        const existing = workspace.members.find((m) => m.userId === member.userId);
        if (existing)
            throw new Error("Member already exists");
        const newMember = { ...member, joinedAt: Date.now() };
        workspace.members.push(newMember);
        workspace.updatedAt = Date.now();
        return newMember;
    }
    async removeMember(workspaceId, userId) {
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace)
            throw new Error("Workspace not found");
        workspace.members = workspace.members.filter((m) => m.userId !== userId);
        workspace.updatedAt = Date.now();
    }
    async updateMemberRole(workspaceId, userId, role) {
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace)
            throw new Error("Workspace not found");
        const member = workspace.members.find((m) => m.userId === userId);
        if (!member)
            throw new Error("Member not found");
        member.role = role;
        workspace.updatedAt = Date.now();
    }
    async getMembers(workspaceId) {
        const workspace = this.workspaces.get(workspaceId);
        if (!workspace)
            throw new Error("Workspace not found");
        return workspace.members;
    }
}
//# sourceMappingURL=workspace.js.map
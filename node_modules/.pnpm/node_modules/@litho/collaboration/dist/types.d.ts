export type MemberRole = "owner" | "admin" | "engineer" | "viewer";
export interface Workspace {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    members: WorkspaceMember[];
    createdAt: number;
    updatedAt: number;
}
export interface WorkspaceMember {
    userId: string;
    name: string;
    email: string;
    role: MemberRole;
    joinedAt: number;
}
export interface JobVersion {
    id: string;
    jobId: string;
    version: number;
    author: string;
    description: string;
    data: Record<string, unknown>;
    parentVersion?: string;
    createdAt: number;
}
export interface CollaborationConfig {
    maxMembersPerWorkspace: number;
    maxVersionsPerJob: number;
    enableComments: boolean;
}
//# sourceMappingURL=types.d.ts.map
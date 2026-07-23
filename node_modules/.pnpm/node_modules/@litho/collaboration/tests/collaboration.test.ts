import { describe, it, expect } from "vitest";
import { WorkspaceManager } from "../src/workspace.js";
import { VersionControl } from "../src/versioning.js";
import type { CollaborationConfig } from "../src/types.js";

const testConfig: CollaborationConfig = {
  maxMembersPerWorkspace: 10,
  maxVersionsPerJob: 50,
  enableComments: true,
};

describe("WorkspaceManager", () => {
  it("should create workspace", async () => {
    const manager = new WorkspaceManager(testConfig);
    const ws = await manager.createWorkspace("Test WS", "Description", "user-1");

    expect(ws.id).toBeDefined();
    expect(ws.name).toBe("Test WS");
    expect(ws.ownerId).toBe("user-1");
    expect(ws.members.length).toBe(1);
  });

  it("should add member", async () => {
    const manager = new WorkspaceManager(testConfig);
    const ws = await manager.createWorkspace("Test WS", "Description", "user-1");

    const member = await manager.addMember(ws.id, {
      userId: "user-2",
      name: "Engineer",
      email: "eng@test.com",
      role: "engineer",
    });

    expect(member.userId).toBe("user-2");
    expect(member.role).toBe("engineer");
  });

  it("should remove member", async () => {
    const manager = new WorkspaceManager(testConfig);
    const ws = await manager.createWorkspace("Test WS", "Description", "user-1");
    await manager.addMember(ws.id, { userId: "user-2", name: "E", email: "", role: "engineer" });

    await manager.removeMember(ws.id, "user-2");
    const members = await manager.getMembers(ws.id);
    expect(members.length).toBe(1);
  });

  it("should update member role", async () => {
    const manager = new WorkspaceManager(testConfig);
    const ws = await manager.createWorkspace("Test WS", "Description", "user-1");
    await manager.addMember(ws.id, { userId: "user-2", name: "E", email: "", role: "engineer" });

    await manager.updateMemberRole(ws.id, "user-2", "admin");
    const members = await manager.getMembers(ws.id);
    expect(members[1].role).toBe("admin");
  });

  it("should list workspaces for user", async () => {
    const manager = new WorkspaceManager(testConfig);
    const ws1 = await manager.createWorkspace("WS1", "Desc", "user-1");

    const workspaces = await manager.listWorkspaces("user-1");
    expect(workspaces.length).toBe(1);
    expect(workspaces[0].id).toBe(ws1.id);
    expect(workspaces[0].members[0].userId).toBe("user-1");
  });
});

describe("VersionControl", () => {
  it("should create version", async () => {
    const vc = new VersionControl(testConfig);
    const version = await vc.createVersion("job-1", "user-1", "Initial", { param: "value" });

    expect(version.id).toBeDefined();
    expect(version.version).toBe(1);
    expect(version.jobId).toBe("job-1");
  });

  it("should get version history", async () => {
    const vc = new VersionControl(testConfig);
    await vc.createVersion("job-1", "user-1", "v1", { param: "value1" });
    await vc.createVersion("job-1", "user-1", "v2", { param: "value2" });

    const history = await vc.getVersionHistory("job-1");
    expect(history.length).toBe(2);
    expect(history[0].version).toBe(1);
    expect(history[1].version).toBe(2);
  });

  it("should get latest version", async () => {
    const vc = new VersionControl(testConfig);
    await vc.createVersion("job-1", "user-1", "v1", { param: "value1" });
    await vc.createVersion("job-1", "user-1", "v2", { param: "value2" });

    const latest = await vc.getLatestVersion("job-1");
    expect(latest!.version).toBe(2);
  });

  it("should revert to version", async () => {
    const vc = new VersionControl(testConfig);
    await vc.createVersion("job-1", "user-1", "v1", { param: "value1" });
    await vc.createVersion("job-1", "user-1", "v2", { param: "value2" });

    const reverted = await vc.revertToVersion("job-1", 1);
    expect(reverted.version).toBe(3);
    expect(reverted.description).toContain("Reverted");
  });

  it("should compare versions", async () => {
    const vc = new VersionControl(testConfig);
    await vc.createVersion("job-1", "user-1", "v1", { param: "value1" });
    await vc.createVersion("job-1", "user-1", "v2", { param: "value2" });

    const diff = await vc.compareVersions("job-1", 1, 2);
    expect(diff.differences).toContain("param");
  });
});

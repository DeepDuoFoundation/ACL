/**
 * Collaboration Suite — PRD §6.10
 * Team workspaces, experiment tracking, versioning, annotations, shared DT sessions
 */

export interface Workspace {
  id: string;
  name: string;
  members: string[];
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

export interface Experiment {
  id: string;
  workspaceId: string;
  name: string;
  parameters: Record<string, any>;
  results: Record<string, any>;
  version: number;
  createdBy: string;
  annotations: Annotation[];
  createdAt: string;
}

export interface Annotation {
  id: string;
  author: string;
  text: string;
  targetId?: string;
  resolved: boolean;
  createdAt: string;
}

export class CollaborationManager {
  private workspaces: Map<string, Workspace> = new Map();
  private experiments: Map<string, Experiment> = new Map();

  async createWorkspace(name: string, owner: string): Promise<Workspace> {
    const ws: Workspace = { id: `ws_${Date.now()}`, name, members: [owner], role: 'admin', createdAt: new Date().toISOString() };
    this.workspaces.set(ws.id, ws);
    return ws;
  }

  async addMember(workspaceId: string, userId: string, role: 'admin' | 'editor' | 'viewer'): Promise<void> {
    const ws = this.workspaces.get(workspaceId);
    if (ws) { ws.members.push(userId); ws.role = role; }
  }

  async createExperiment(workspaceId: string, name: string, params: Record<string, any>, userId: string): Promise<Experiment> {
    const exp: Experiment = {
      id: `exp_${Date.now()}`, workspaceId, name, parameters: params, results: {},
      version: 1, createdBy: userId, annotations: [], createdAt: new Date().toISOString(),
    };
    this.experiments.set(exp.id, exp);
    return exp;
  }

  async addAnnotation(experimentId: string, author: string, text: string, targetId?: string): Promise<Annotation> {
    const ann: Annotation = { id: `ann_${Date.now()}`, author, text, targetId, resolved: false, createdAt: new Date().toISOString() };
    const exp = this.experiments.get(experimentId);
    if (exp) exp.annotations.push(ann);
    return ann;
  }

  async listExperiments(workspaceId: string): Promise<Experiment[]> {
    return Array.from(this.experiments.values()).filter(e => e.workspaceId === workspaceId);
  }
}
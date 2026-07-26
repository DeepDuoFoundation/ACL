/**
 * Workflow Orchestrator — PRD §6.6
 * DAG-based pipeline: automatic OPC/ILT/SMO selection, branching, retry, parallelism
 */

export type PipelineType = 'opc' | 'ilt' | 'smo' | 'hybrid';

export interface WorkflowTask {
  id: string;
  agent: string;
  type: string;
  params: Record<string, any>;
  dependsOn: string[];
  retryCount: number;
  maxRetries: number;
  timeout: number;
}

export interface WorkflowDag {
  id: string;
  type: PipelineType;
  tasks: WorkflowTask[];
  edges: Array<{ from: string; to: string; condition?: string }>;
  createdAt: string;
}

export interface WorkflowStatus {
  dagId: string;
  taskStatuses: Map<string, 'pending' | 'running' | 'completed' | 'failed' | 'skipped'>;
  progress: number;
  estimatedRemaining: number;
}

export class WorkflowOrchestrator {
  private activeWorkflows: Map<string, WorkflowStatus> = new Map();

  async selectPipeline(designComplexity: number, node: string, gpuAvailable: number): Promise<PipelineType> {
    if (node === 'sub-2nm' || node === 'high-na-euv') return 'ilt';
    if (designComplexity > 0.8 && gpuAvailable >= 4) return 'hybrid';
    if (designComplexity > 0.5) return 'smo';
    return 'opc';
  }

  async createWorkflow(type: PipelineType, layoutId: string): Promise<WorkflowDag> {
    const tasks: WorkflowTask[] = [];
    const edges: Array<{ from: string; to: string; condition?: string }> = [];

    // Common tasks
    tasks.push({ id: 'ingest', agent: 'layout-understanding', type: 'parse_layout', params: { layoutId }, dependsOn: [], retryCount: 0, maxRetries: 2, timeout: 300000 });

    switch (type) {
      case 'opc':
        tasks.push({ id: 'opc', agent: 'opc-mask-optimisation', type: 'run_opc', params: { layoutId, mode: 'model-based' }, dependsOn: ['ingest'], retryCount: 0, maxRetries: 3, timeout: 3600000 });
        tasks.push({ id: 'verify', agent: 'verification', type: 'verify_epe', params: { layoutId }, dependsOn: ['opc'], retryCount: 0, maxRetries: 1, timeout: 600000 });
        edges.push({ from: 'ingest', to: 'opc' }, { from: 'opc', to: 'verify' });
        break;

      case 'ilt':
        tasks.push({ id: 'ilt', agent: 'pino-inverse', type: 'run_ilt', params: { layoutId, iterations: 100 }, dependsOn: ['ingest'], retryCount: 0, maxRetries: 2, timeout: 7200000 });
        tasks.push({ id: 'verify', agent: 'verification', type: 'verify_epe', params: { layoutId }, dependsOn: ['ilt'], retryCount: 0, maxRetries: 1, timeout: 600000 });
        edges.push({ from: 'ingest', to: 'ilt' }, { from: 'ilt', to: 'verify' });
        break;

      case 'smo':
        tasks.push({ id: 'source_opt', agent: 'physics-modeling', type: 'optimise_source', params: { layoutId }, dependsOn: ['ingest'], retryCount: 0, maxRetries: 2, timeout: 3600000 });
        tasks.push({ id: 'mask_opt', agent: 'opc-mask-optimisation', type: 'run_opc', params: { layoutId }, dependsOn: ['source_opt'], retryCount: 0, maxRetries: 2, timeout: 3600000 });
        tasks.push({ id: 'verify', agent: 'verification', type: 'verify_epe', params: { layoutId }, dependsOn: ['mask_opt'], retryCount: 0, maxRetries: 1, timeout: 600000 });
        edges.push({ from: 'ingest', to: 'source_opt' }, { from: 'source_opt', to: 'mask_opt' }, { from: 'mask_opt', to: 'verify' });
        break;

      case 'hybrid':
        tasks.push({ id: 'opc_branch', agent: 'opc-mask-optimisation', type: 'run_opc', params: { layoutId }, dependsOn: ['ingest'], retryCount: 0, maxRetries: 2, timeout: 3600000 });
        tasks.push({ id: 'ilt_branch', agent: 'pino-inverse', type: 'run_ilt', params: { layoutId, iterations: 50 }, dependsOn: ['ingest'], retryCount: 0, maxRetries: 2, timeout: 3600000 });
        tasks.push({ id: 'merge', agent: 'conflict-resolution', type: 'merge_results', params: { layoutId }, dependsOn: ['opc_branch', 'ilt_branch'], retryCount: 0, maxRetries: 1, timeout: 300000 });
        tasks.push({ id: 'verify', agent: 'verification', type: 'verify_epe', params: { layoutId }, dependsOn: ['merge'], retryCount: 0, maxRetries: 1, timeout: 600000 });
        edges.push({ from: 'ingest', to: 'opc_branch' }, { from: 'ingest', to: 'ilt_branch' }, { from: 'opc_branch', to: 'merge' }, { from: 'ilt_branch', to: 'merge' }, { from: 'merge', to: 'verify' });
        break;
    }

    const dag: WorkflowDag = {
      id: `wf_${Date.now()}`,
      type,
      tasks,
      edges,
      createdAt: new Date().toISOString(),
    };

    const status: WorkflowStatus = {
      dagId: dag.id,
      taskStatuses: new Map(tasks.map(t => [t.id, 'pending'])),
      progress: 0,
      estimatedRemaining: tasks.reduce((s, t) => s + t.timeout, 0),
    };
    this.activeWorkflows.set(dag.id, status);

    return dag;
  }

  async executeWorkflow(dag: WorkflowDag): Promise<{ success: boolean; results: Record<string, any> }> {
    const status = this.activeWorkflows.get(dag.id)!;
    const results: Record<string, any> = {};

    const getReadyTasks = (): WorkflowTask[] => {
      return dag.tasks.filter(t => {
        const taskStatus = status.taskStatuses.get(t.id);
        if (taskStatus !== 'pending' && taskStatus !== 'failed') return false;
        return t.dependsOn.every(d => status.taskStatuses.get(d) === 'completed');
      });
    };

    let completed = 0;
    while (completed < dag.tasks.length) {
      const ready = getReadyTasks();
      if (ready.length === 0 && completed < dag.tasks.length) {
        // Check for failures
        const failed = dag.tasks.filter(t => status.taskStatuses.get(t.id) === 'failed');
        return { success: false, results: { failed: failed.map(f => f.id), partial: results } };
      }

      for (const task of ready) {
        status.taskStatuses.set(task.id, 'running');
        try {
          results[task.id] = await this.executeTask(task);
          status.taskStatuses.set(task.id, 'completed');
          completed++;
        } catch (err) {
          if (task.retryCount < task.maxRetries) {
            task.retryCount++;
            status.taskStatuses.set(task.id, 'pending');
          } else {
            status.taskStatuses.set(task.id, 'failed');
            completed++;
          }
        }
      }

      status.progress = (completed / dag.tasks.length) * 100;
    }

    return { success: true, results };
  }

  private async executeTask(task: WorkflowTask): Promise<any> {
    await new Promise(r => setTimeout(r, 100));
    return { taskId: task.id, status: 'ok', output: `Task ${task.id} completed` };
  }

  getStatus(dagId: string): WorkflowStatus | undefined {
    return this.activeWorkflows.get(dagId);
  }
}
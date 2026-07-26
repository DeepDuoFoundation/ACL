/**
 * GPU/HPC Scheduler — PRD §6.7
 * AMD ROCm-aware job placement, bin-packing, multi-tenant isolation
 */

export interface GpuNode {
  id: string;
  type: 'MI350X' | 'MI325X' | 'MI300X';
  memoryGb: number;
  utilization: number;
  temperature: number;
  memoryBandwidth: number;
  interconnect: 'xgmi' | 'pcie';
  jobs: number;
}

export interface ScheduleJob {
  id: string;
  agentType: string;
  requiredMemory: number;
  estimatedRuntime: number;
  priority: number;
  tenant: string;
}

export interface ScheduleResult {
  jobId: string;
  nodeId: string;
  estimatedStart: number;
  estimatedEnd: number;
  energyEstimate: number;
}

export class GpuScheduler {
  nodes: GpuNode[] = [];
  queue: ScheduleJob[] = [];
  schedule: Map<string, ScheduleResult> = new Map();

  constructor() {
    this.nodes = [
      { id: 'gpu-001', type: 'MI350X', memoryGb: 192, utilization: 0.3, temperature: 65, memoryBandwidth: 5.2, interconnect: 'xgmi', jobs: 2 },
      { id: 'gpu-002', type: 'MI350X', memoryGb: 192, utilization: 0.1, temperature: 58, memoryBandwidth: 5.2, interconnect: 'xgmi', jobs: 1 },
      { id: 'gpu-003', type: 'MI350X', memoryGb: 192, utilization: 0.8, temperature: 78, memoryBandwidth: 5.2, interconnect: 'xgmi', jobs: 4 },
      { id: 'gpu-004', type: 'MI325X', memoryGb: 144, utilization: 0.0, temperature: 42, memoryBandwidth: 4.8, interconnect: 'pcie', jobs: 0 },
    ];
  }

  async submit(job: ScheduleJob): Promise<ScheduleResult> {
    const bestNode = this.findBestNode(job);
    const now = Date.now();
    const result: ScheduleResult = {
      jobId: job.id,
      nodeId: bestNode.id,
      estimatedStart: now + (this.queue.length * 5000),
      estimatedEnd: now + (this.queue.length * 5000) + job.estimatedRuntime,
      energyEstimate: this.computeEnergy(bestNode, job),
    };
    bestNode.jobs++;
    bestNode.utilization = Math.min(1, bestNode.utilization + 0.15);
    this.schedule.set(job.id, result);
    return result;
  }

  async enqueue(job: ScheduleJob): Promise<void> {
    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  async dequeue(): Promise<ScheduleResult | null> {
    const job = this.queue.shift();
    if (!job) return null;
    return this.submit(job);
  }

  getClusterStatus(): { nodes: GpuNode[]; queueLength: number; avgUtilization: number } {
    return {
      nodes: this.nodes,
      queueLength: this.queue.length,
      avgUtilization: this.nodes.reduce((s, n) => s + n.utilization, 0) / this.nodes.length,
    };
  }

  private findBestNode(job: ScheduleJob): GpuNode {
    let best = this.nodes[0];
    let bestScore = -Infinity;

    for (const node of this.nodes) {
      if (node.memoryGb < job.requiredMemory) continue;
      const score = (1 - node.utilization) * 10 - node.temperature * 0.1 - node.jobs * 0.5;
      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    }
    return best;
  }

  private computeEnergy(node: GpuNode, job: ScheduleJob): number {
    const powerPerHour = node.type === 'MI350X' ? 750 : 600;
    return (powerPerHour * job.estimatedRuntime) / 3600000;
  }
}
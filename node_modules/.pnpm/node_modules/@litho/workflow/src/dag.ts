import type { WorkflowStep } from "./types.js";

export class DAG {
  private adjacency = new Map<string, Set<string>>();
  private inDegree = new Map<string, number>();

  addNode(id: string): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, new Set());
      this.inDegree.set(id, 0);
    }
  }

  addEdge(from: string, to: string): void {
    this.addNode(from);
    this.addNode(to);
    this.adjacency.get(from)!.add(to);
    this.inDegree.set(to, (this.inDegree.get(to) ?? 0) + 1);
  }

  fromSteps(steps: WorkflowStep[]): void {
    for (const step of steps) {
      this.addNode(step.id);
      for (const dep of step.dependencies) {
        this.addEdge(dep, step.id);
      }
    }
  }

  getReady(inProgress: Set<string>): string[] {
    const ready: string[] = [];
    for (const [node, degree] of this.inDegree) {
      if (degree === 0 && !inProgress.has(node)) {
        ready.push(node);
      }
    }
    return ready;
  }

  complete(id: string): void {
    const neighbors = this.adjacency.get(id);
    if (neighbors) {
      for (const neighbor of neighbors) {
        this.inDegree.set(neighbor, (this.inDegree.get(neighbor) ?? 1) - 1);
      }
    }
  }

  isCyclic(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = this.adjacency.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            if (dfs(neighbor)) return true;
          } else if (recursionStack.has(neighbor)) {
            return true;
          }
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of this.adjacency.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }
    return false;
  }

  topologicalSort(): string[] {
    const inDeg = new Map(this.inDegree);
    const queue: string[] = [];
    for (const [node, deg] of inDeg) {
      if (deg === 0) queue.push(node);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);
      const neighbors = this.adjacency.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          const newDeg = (inDeg.get(neighbor) ?? 1) - 1;
          inDeg.set(neighbor, newDeg);
          if (newDeg === 0) queue.push(neighbor);
        }
      }
    }
    return sorted;
  }
}

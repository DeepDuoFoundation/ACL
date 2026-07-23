import type { WorkflowStep } from "./types.js";
export declare class DAG {
    private adjacency;
    private inDegree;
    addNode(id: string): void;
    addEdge(from: string, to: string): void;
    fromSteps(steps: WorkflowStep[]): void;
    getReady(inProgress: Set<string>): string[];
    complete(id: string): void;
    isCyclic(): boolean;
    topologicalSort(): string[];
}
//# sourceMappingURL=dag.d.ts.map
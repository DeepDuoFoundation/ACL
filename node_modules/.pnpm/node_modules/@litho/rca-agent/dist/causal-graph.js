export class CausalGraph {
    nodes = new Map();
    edges = new Array();
    addNode(node) {
        this.nodes.set(node.id, node);
    }
    addEdge(from, to, relationship, weight) {
        this.edges.push({ from, to, relationship, weight });
    }
    traverse(startId, maxDepth) {
        const visited = new Set();
        const result = [];
        const queue = [{ id: startId, depth: 0 }];
        while (queue.length > 0) {
            const { id, depth } = queue.shift();
            if (visited.has(id) || depth > maxDepth)
                continue;
            visited.add(id);
            const node = this.nodes.get(id);
            if (node) {
                result.push(node);
                for (const conn of node.connections) {
                    queue.push({ id: conn, depth: depth + 1 });
                }
            }
        }
        return result;
    }
    findRelatedNodes(symptom) {
        const related = [];
        for (const node of this.nodes.values()) {
            if (node.type === "layer" && node.properties.name === symptom.layer) {
                related.push(node);
            }
            if (node.type === "process" && node.properties.location === symptom.location) {
                related.push(node);
            }
        }
        return related;
    }
    getNode(id) {
        return this.nodes.get(id);
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getEdges() {
        return [...this.edges];
    }
}
//# sourceMappingURL=causal-graph.js.map
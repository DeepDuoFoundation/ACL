export class KnowledgeGraph {
    nodes = new Map();
    edges = new Map();
    adjacency = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    addNode(node) {
        this.nodes.set(node.id, node);
        if (!this.adjacency.has(node.id)) {
            this.adjacency.set(node.id, new Set());
        }
    }
    addEdge(edge) {
        this.edges.set(edge.id, edge);
        const neighbors = this.adjacency.get(edge.source) ?? new Set();
        neighbors.add(edge.target);
        this.adjacency.set(edge.source, neighbors);
    }
    getNode(id) {
        return this.nodes.get(id);
    }
    getEdge(id) {
        return this.edges.get(id);
    }
    getNeighbors(nodeId) {
        const neighborIds = this.adjacency.get(nodeId) ?? new Set();
        return Array.from(neighborIds)
            .map((id) => this.nodes.get(id))
            .filter((n) => n !== undefined);
    }
    traverse(startId, maxDepth) {
        const depth = maxDepth ?? this.config.maxTraversalDepth;
        const visited = new Set();
        const result = [];
        const queue = [{ id: startId, depth: 0 }];
        while (queue.length > 0) {
            const { id, depth: currentDepth } = queue.shift();
            if (visited.has(id) || currentDepth > depth)
                continue;
            visited.add(id);
            const node = this.nodes.get(id);
            if (node && node.confidence >= this.config.minConfidence) {
                result.push(node);
                const neighbors = this.adjacency.get(id) ?? new Set();
                for (const neighborId of neighbors) {
                    queue.push({ id: neighborId, depth: currentDepth + 1 });
                }
            }
        }
        return result.slice(0, this.config.maxResults);
    }
    findByType(type) {
        return Array.from(this.nodes.values()).filter((n) => n.type === type);
    }
    findByProperty(key, value) {
        return Array.from(this.nodes.values()).filter((n) => n.properties[key] === value);
    }
    findCausalPaths(sourceId, targetId) {
        const paths = [];
        const visited = new Set();
        const dfs = (currentId, path, edgePath) => {
            if (currentId === targetId) {
                const confidence = path.reduce((min, n) => Math.min(min, n.confidence), 1);
                paths.push({ nodes: [...path], edges: [...edgePath], confidence });
                return;
            }
            if (visited.has(currentId) || path.length > this.config.maxTraversalDepth)
                return;
            visited.add(currentId);
            const neighbors = this.adjacency.get(currentId) ?? new Set();
            for (const neighborId of neighbors) {
                const node = this.nodes.get(neighborId);
                const edge = Array.from(this.edges.values()).find((e) => e.source === currentId && e.target === neighborId);
                if (node && edge) {
                    path.push(node);
                    edgePath.push(edge);
                    dfs(neighborId, path, edgePath);
                    path.pop();
                    edgePath.pop();
                }
            }
            visited.delete(currentId);
        };
        dfs(sourceId, [], []);
        return paths;
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getAllEdges() {
        return Array.from(this.edges.values());
    }
    getStats() {
        const byType = {};
        for (const node of this.nodes.values()) {
            byType[node.type] = (byType[node.type] ?? 0) + 1;
        }
        return { nodeCount: this.nodes.size, edgeCount: this.edges.size, byType };
    }
}
//# sourceMappingURL=graph.js.map
from dataclasses import dataclass, field


@dataclass
class GPUNode:
    node_id: str
    hostname: str
    gpus: list[dict]
    xgmi_peers: list[str] = field(default_factory=list)
    cpu_cores: int = 96
    ram_gb: int = 512


class ClusterTopology:
    def __init__(self):
        self.nodes: dict[str, GPUNode] = {}

    def add_node(self, node: GPUNode):
        self.nodes[node.node_id] = node

    def remove_node(self, node_id: str):
        self.nodes.pop(node_id, None)

    def get_node(self, node_id: str) -> GPUNode | None:
        return self.nodes.get(node_id)

    def get_all_nodes(self) -> list[GPUNode]:
        return list(self.nodes.values())

    def get_available_gpus(self, node_id: str) -> list[dict]:
        node = self.nodes.get(node_id)
        if not node:
            return []
        return [g for g in node.gpus if g.get("utilisation", 0) < 90]

    def get_xgmi_peers(self, node_id: str) -> list[str]:
        node = self.nodes.get(node_id)
        return node.xgmi_peers if node else []

    def total_gpus(self) -> int:
        return sum(len(n.gpus) for n in self.nodes.values())

    def avg_utilisation(self) -> float:
        all_gpus = [g for n in self.nodes.values() for g in n.gpus]
        if not all_gpus:
            return 0.0
        return sum(g.get("utilisation", 0) for g in all_gpus) / len(all_gpus)

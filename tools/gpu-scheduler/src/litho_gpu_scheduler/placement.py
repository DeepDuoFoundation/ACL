from typing import Optional
from .cluster_topology import ClusterTopology


class JobPlacer:
    def __init__(self, cluster: ClusterTopology):
        self.cluster = cluster

    def find_best_placement(self, job: dict) -> Optional[dict]:
        required_gpus = job.get("gpu_count", 1)
        required_memory = job.get("memoryGB", 64)
        best_node = None
        best_score = -1

        for node in self.cluster.get_all_nodes():
            available = self.cluster.get_available_gpus(node.node_id)
            if len(available) < required_gpus:
                continue
            total_memory = sum(g.get("memoryGB", 0) for g in available[:required_gpus])
            if total_memory < required_memory:
                continue
            # Score: prefer low utilisation
            avg_util = sum(g.get("utilisation", 0) for g in available[:required_gpus]) / required_gpus
            score = 100 - avg_util
            if score > best_score:
                best_score = score
                best_node = node

        if best_node is None:
            return None

        gpus = self.cluster.get_available_gpus(best_node.node_id)[:required_gpus]
        return {
            "node_id": best_node.node_id,
            "hostname": best_node.hostname,
            "gpu_ids": [g["gpu_id"] for g in gpus],
        }

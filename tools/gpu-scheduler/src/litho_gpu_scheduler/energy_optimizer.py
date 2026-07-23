from typing import Optional
from .cluster_topology import ClusterTopology


class EnergyOptimizer:
    def __init__(self, cluster: ClusterTopology, energy_cost_per_kwh: float = 0.10):
        self.cluster = cluster
        self.energy_cost = energy_cost_per_kwh

    def estimate_energy_cost(self, node_id: str, gpu_count: int, runtime_hours: float) -> float:
        node = self.cluster.get_node(node_id)
        if not node:
            return float("inf")
        # Simplified: ~300W per GPU under load
        power_kw = gpu_count * 0.3
        return power_kw * runtime_hours * self.energy_cost

    def find_energy_optimal_placement(self, job: dict) -> Optional[dict]:
        from .placement import JobPlacer
        placer = JobPlacer(self.cluster)
        best_placement = None
        best_cost = float("inf")

        for node in self.cluster.get_all_nodes():
            required_gpus = job.get("gpu_count", 1)
            available = self.cluster.get_available_gpus(node.node_id)
            if len(available) < required_gpus:
                continue
            runtime_hours = job.get("estimatedRuntimeMs", 3600000) / 3_600_000
            cost = self.estimate_energy_cost(node.node_id, required_gpus, runtime_hours)
            if cost < best_cost:
                best_cost = cost
                best_placement = {
                    "node_id": node.node_id,
                    "hostname": node.hostname,
                    "gpu_ids": [g["gpu_id"] for g in available[:required_gpus]],
                    "energy_cost": cost,
                }
        return best_placement

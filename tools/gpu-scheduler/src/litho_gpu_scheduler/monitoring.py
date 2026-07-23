from .cluster_topology import ClusterTopology


class MonitoringDashboard:
    def __init__(self, cluster: ClusterTopology):
        self.cluster = cluster

    def get_cluster_stats(self) -> dict:
        total_gpus = self.cluster.total_gpus()
        avg_util = self.cluster.avg_utilisation()
        nodes = self.cluster.get_all_nodes()
        return {
            "total_nodes": len(nodes),
            "total_gpus": total_gpus,
            "avg_utilisation": avg_util,
            "nodes": [
                {
                    "node_id": n.node_id,
                    "hostname": n.hostname,
                    "gpu_count": len(n.gpus),
                    "utilisation": sum(g.get("utilisation", 0) for g in n.gpus) / max(len(n.gpus), 1),
                }
                for n in nodes
            ],
        }

    def get_node_stats(self, node_id: str) -> dict:
        node = self.cluster.get_node(node_id)
        if not node:
            return {}
        return {
            "node_id": node.node_id,
            "hostname": node.hostname,
            "gpus": node.gpus,
            "xgmi_peers": node.xgmi_peers,
        }

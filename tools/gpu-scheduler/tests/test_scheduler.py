import pytest
from litho_gpu_scheduler.cluster_topology import ClusterTopology, GPUNode
from litho_gpu_scheduler.placement import JobPlacer
from litho_gpu_scheduler.queue_manager import PriorityQueue
from litho_gpu_scheduler.monitoring import MonitoringDashboard


def test_cluster_topology_add_node():
    cluster = ClusterTopology()
    node = GPUNode(
        node_id="node-1", hostname="gpu-host-1",
        gpus=[{"gpu_id": "0", "memoryGB": 192, "utilisation": 0.0}],
        xgmi_peers=["node-2"],
    )
    cluster.add_node(node)
    assert cluster.get_node("node-1") is not None
    assert len(cluster.get_all_nodes()) == 1


def test_priority_queue_ordering():
    pq = PriorityQueue()
    pq.enqueue({"job_id": "low", "priority": 1, "memoryGB": 16})
    pq.enqueue({"job_id": "high", "priority": 10, "memoryGB": 16})
    pq.enqueue({"job_id": "med", "priority": 5, "memoryGB": 16})
    assert pq.dequeue()["job_id"] == "high"
    assert pq.dequeue()["job_id"] == "med"
    assert pq.dequeue()["job_id"] == "low"


def test_job_placement():
    cluster = ClusterTopology()
    node = GPUNode(
        node_id="node-1", hostname="gpu-host-1",
        gpus=[{"gpu_id": "0", "memoryGB": 192, "utilisation": 0.0}],
        xgmi_peers=[],
    )
    cluster.add_node(node)
    placer = JobPlacer(cluster)
    job = {"job_id": "test", "memoryGB": 64, "gpu_count": 1}
    placement = placer.find_best_placement(job)
    assert placement is not None
    assert placement["node_id"] == "node-1"


def test_monitoring_dashboard():
    cluster = ClusterTopology()
    node = GPUNode(
        node_id="node-1", hostname="gpu-host-1",
        gpus=[{"gpu_id": "0", "memoryGB": 192, "utilisation": 75.0}],
        xgmi_peers=[],
    )
    cluster.add_node(node)
    dashboard = MonitoringDashboard(cluster)
    stats = dashboard.get_cluster_stats()
    assert stats["total_gpus"] == 1
    assert stats["avg_utilisation"] == 75.0

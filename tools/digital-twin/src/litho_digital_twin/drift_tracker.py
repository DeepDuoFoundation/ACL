from collections import defaultdict
from typing import Optional


class DriftTracker:
    def __init__(self):
        self.measurements: dict[str, list[tuple[float, float]]] = defaultdict(list)

    def record_measurement(self, equipment_id: str, metric: str, value: float):
        key = f"{equipment_id}:{metric}"
        import time
        self.measurements[key].append((time.time(), value))

    def get_drift(self, equipment_id: str, metric: str) -> Optional[float]:
        key = f"{equipment_id}:{metric}"
        if not self.measurements[key]:
            return None
        return self.measurements[key][-1][1]

    def get_drift_rate(self, equipment_id: str, metric: str) -> Optional[float]:
        key = f"{equipment_id}:{metric}"
        data = self.measurements[key]
        if len(data) < 2:
            return None
        dt = data[-1][0] - data[0][0]
        dv = data[-1][1] - data[0][1]
        return dv / dt if dt > 0 else 0.0

    def is_drift_alert(self, equipment_id: str, metric: str, threshold: float) -> bool:
        drift = self.get_drift(equipment_id, metric)
        return abs(drift) > threshold if drift is not None else False

from typing import Any
from .drift_tracker import DriftTracker


class CalibrationService:
    def __init__(self, drift_tracker: DriftTracker = None):
        self.drift_tracker = drift_tracker or DriftTracker()
        self.calibration_records: list[dict] = []

    def ingest_metrology(self, equipment_id: str, metric: str, value: float, timestamp: float = None):
        import time
        ts = timestamp or time.time()
        self.drift_tracker.record_measurement(equipment_id, metric, value)
        self.calibration_records.append({
            "equipment_id": equipment_id,
            "metric": metric,
            "value": value,
            "timestamp": ts,
        })

    def needs_recalibration(self, equipment_id: str, metric: str, threshold: float = 0.02) -> bool:
        return self.drift_tracker.is_drift_alert(equipment_id, metric, threshold)

    def get_calibration_history(self, equipment_id: str) -> list[dict]:
        return [r for r in self.calibration_records if r["equipment_id"] == equipment_id]

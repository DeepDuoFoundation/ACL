import pytest
from litho_digital_twin.simulation_pipeline import SimulationPipeline
from litho_digital_twin.equipment_models import ScannerModel
from litho_digital_twin.whatif_engine import WhatIfEngine
from litho_digital_twin.drift_tracker import DriftTracker


def test_simulation_pipeline_end_to_end():
    pipeline = SimulationPipeline(scanner=ScannerModel())
    result = pipeline.simulate(
        mask_data={"polygons": [{"layer": 1, "points": [[0, 0], [100, 0], [100, 100], [0, 100]]}]},
        dose=30.0,
        focus=0.0,
    )
    assert "aerial_image" in result
    assert "resist_profile" in result
    assert result["simulated"] is True


def test_whatif_engine_variations():
    engine = WhatIfEngine(scanner=ScannerModel())
    results = engine.run_experiment(
        base_params={"dose": 30.0, "focus": 0.0},
        variations={"dose": [-0.5, 0, 0.5], "focus": [-10, 0, 10]},
    )
    assert len(results) == 9  # 3x3 combinations


def test_drift_tracker():
    tracker = DriftTracker()
    tracker.record_measurement("scanner_1", "focus_drift", 0.5)
    tracker.record_measurement("scanner_1", "focus_drift", 1.2)
    assert tracker.get_drift("scanner_1", "focus_drift") == 1.2
    assert tracker.is_drift_alert("scanner_1", "focus_drift", threshold=1.0) is True

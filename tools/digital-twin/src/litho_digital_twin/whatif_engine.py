import itertools
from typing import Any
from .equipment_models import ScannerModel
from .simulation_pipeline import SimulationPipeline


class WhatIfEngine:
    def __init__(self, scanner: ScannerModel = None):
        self.pipeline = SimulationPipeline(scanner=scanner)

    def run_experiment(self, base_params: dict, variations: dict[str, list]) -> list[dict]:
        keys = list(variations.keys())
        value_combos = list(itertools.product(*variations.values()))

        results = []
        for combo in value_combos:
            params = {**base_params}
            for key, value in zip(keys, combo):
                params[key] = value
            sim_result = self.pipeline.simulate(
                mask_data={"polygons": [{"layer": 1, "points": [[0, 0], [100, 0], [100, 100], [0, 100]]}]},
                dose=params.get("dose", 30.0),
                focus=params.get("focus", 0.0),
            )
            results.append({
                "params": params,
                "result": sim_result,
            })
        return results

    def sweep_single_param(self, param_name: str, values: list, base_params: dict) -> list[dict]:
        return self.run_experiment(base_params, {param_name: values})

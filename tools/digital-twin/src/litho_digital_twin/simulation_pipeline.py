from typing import Any
from .equipment_models import ScannerModel, ResistModel, EtchModel


class SimulationPipeline:
    def __init__(self, scanner: ScannerModel = None, resist: ResistModel = None, etch: EtchModel = None):
        self.scanner = scanner or ScannerModel()
        self.resist = resist or ResistModel()
        self.etch = etch or EtchModel()

    def simulate(self, mask_data: dict, dose: float = 30.0, focus: float = 0.0) -> dict:
        aerial_image = self._compute_aerial_image(mask_data, dose, focus)
        resist_profile = self.resist.simulate(aerial_image, dose)
        etch_result = self.etch.simulate(resist_profile, self._compute_density(mask_data))

        return {
            "aerial_image": aerial_image,
            "resist_profile": resist_profile,
            "etch_result": etch_result,
            "simulated": True,
        }

    def _compute_aerial_image(self, mask_data: dict, dose: float, focus: float):
        adjusted_dose = self.scanner.apply_dose_variation(dose)
        adjusted_focus = self.scanner.apply_focus_variation(focus)
        # Simplified: return a tensor representing aerial image
        import torch
        return torch.ones(64, 64) * adjusted_dose / 30.0

    def _compute_density(self, mask_data: dict) -> float:
        polygons = mask_data.get("polygons", [])
        return min(len(polygons) / 100.0, 1.0)

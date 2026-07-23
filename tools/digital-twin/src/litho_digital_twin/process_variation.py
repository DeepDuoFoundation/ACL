import random
from dataclasses import dataclass
from typing import Optional


@dataclass
class VariationConfig:
    dose_std_pct: float = 1.0
    focus_std_nm: float = 5.0
    mask_cdu_nm: float = 2.0
    overlay_nm: float = 3.0


class ProcessVariationModel:
    def __init__(self, config: Optional[VariationConfig] = None):
        self.config = config or VariationConfig()

    def sample_dose(self, nominal: float) -> float:
        return random.gauss(nominal, nominal * self.config.dose_std_pct / 100)

    def sample_focus(self, nominal: float) -> float:
        return random.gauss(nominal, self.config.focus_std_nm)

    def monte_carlo_samples(self, nominal_params: dict, n_samples: int = 1000) -> list[dict]:
        samples = []
        for _ in range(n_samples):
            samples.append({
                "dose": self.sample_dose(nominal_params.get("dose", 30.0)),
                "focus": self.sample_focus(nominal_params.get("focus", 0.0)),
                "mask_cdu": random.gauss(0, self.config.mask_cdu_nm),
                "overlay": random.gauss(0, self.config.overlay_nm),
            })
        return samples

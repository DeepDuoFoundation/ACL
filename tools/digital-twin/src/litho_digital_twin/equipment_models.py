from dataclasses import dataclass
from typing import Optional


@dataclass
class ScannerConfig:
    na: float = 0.55
    wavelength_nm: float = 13.5
    sigma_outer: float = 0.8
    sigma_inner: float = 0.3
    dose_nominal_mj: float = 30.0
    focus_nominal_nm: float = 0.0


class ScannerModel:
    def __init__(self, config: Optional[ScannerConfig] = None):
        self.config = config or ScannerConfig()

    def apply_aberrations(self, wavefront, zernike_coeffs: dict):
        return wavefront

    def apply_dose_variation(self, dose_mj: float, variation_pct: float = 0.0):
        return dose_mj * (1 + variation_pct / 100)

    def apply_focus_variation(self, focus_nm: float, variation_nm: float = 0.0):
        return focus_nm + variation_nm


class ResistModel:
    def __init__(self, thickness_nm: float = 100.0, sensitivity: float = 1.0):
        self.thickness_nm = thickness_nm
        self.sensitivity = sensitivity

    def simulate(self, aerial_image, dose: float):
        threshold = 1.0 / self.sensitivity
        return (aerial_image > threshold).float()


class EtchModel:
    def __init__(self, selectivity: float = 5.0, loading_factor: float = 0.1):
        self.selectivity = selectivity
        self.loading_factor = loading_factor

    def simulate(self, resist_profile, pattern_density: float):
        etch_rate = 1.0 / (1.0 + self.loading_factor * pattern_density)
        return resist_profile * etch_rate * self.selectivity

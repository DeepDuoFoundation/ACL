import torch
from .model import FNO2d


class FNOInference:
    def __init__(self, model: FNO2d, device: str = "cpu"):
        self.model = model.to(device)
        self.model.eval()
        self.device = device

    @torch.no_grad()
    def predict(self, input_tensor: torch.Tensor) -> torch.Tensor:
        return self.model(input_tensor.to(self.device))

    def save(self, path: str):
        torch.save(self.model.state_dict(), path)

    def load(self, path: str):
        self.model.load_state_dict(torch.load(path, weights_only=True))

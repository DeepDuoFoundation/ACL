import torch
from .model import PinnaSurrogate


class PinnaInference:
    def __init__(self, model: PinnaSurrogate, device: str = "cpu"):
        self.model = model.to(device)
        self.model.eval()
        self.device = device

    @torch.no_grad()
    def predict(self, input_tensor: torch.Tensor) -> torch.Tensor:
        input_tensor = input_tensor.to(self.device)
        return self.model(input_tensor)

    def save(self, path: str):
        torch.save(self.model.state_dict(), path)

    def load(self, path: str):
        self.model.load_state_dict(torch.load(path, weights_only=True))

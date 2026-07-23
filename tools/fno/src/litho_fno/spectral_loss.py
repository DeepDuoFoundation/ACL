import torch
import torch.nn as nn


class SpectralLoss(nn.Module):
    def __init__(self, alpha: float = 1.0, beta: float = 0.1):
        super().__init__()
        self.alpha = alpha
        self.beta = beta

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        spatial_loss = nn.functional.mse_loss(pred, target)
        pred_fft = torch.fft.rfft2(pred)
        target_fft = torch.fft.rfft2(target)
        frequency_loss = nn.functional.mse_loss(pred_fft.abs(), target_fft.abs())
        return self.alpha * spatial_loss + self.beta * frequency_loss

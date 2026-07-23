import torch
import torch.nn as nn


class PhysicsLoss(nn.Module):
    def __init__(self, data_weight: float = 1.0, pde_weight: float = 0.1):
        super().__init__()
        self.data_weight = data_weight
        self.pde_weight = pde_weight

    def forward(self, pred: torch.Tensor, target: torch.Tensor, input_data: torch.Tensor) -> torch.Tensor:
        data_loss = nn.functional.mse_loss(pred, target)
        pde_loss = self._pde_residual(pred, input_data)
        return self.data_weight * data_loss + self.pde_weight * pde_loss

    def _pde_residual(self, output: torch.Tensor, input_data: torch.Tensor) -> torch.Tensor:
        grad_x = torch.autograd.grad(output, input_data, grad_outputs=torch.ones_like(output), create_graph=True, retain_graph=True)[0]
        if grad_x is not None:
            laplacian = torch.autograd.grad(grad_x, input_data, grad_outputs=torch.ones_like(grad_x), create_graph=True, retain_graph=True)[0]
            if laplacian is not None:
                residual = laplacian + output
                return torch.mean(residual ** 2)
        return torch.tensor(0.0, device=output.device)

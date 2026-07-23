import torch
from torch.utils.data import DataLoader, TensorDataset
from .model import FNO2d
from .spectral_loss import SpectralLoss


class FNOTrainer:
    def __init__(self, model: FNO2d, lr: float = 1e-3):
        self.model = model
        self.optimizer = torch.optim.Adam(model.parameters(), lr=lr)
        self.loss_fn = SpectralLoss()

    def train_epoch(self, dataloader: DataLoader) -> float:
        self.model.train()
        total_loss = 0.0
        for batch_input, batch_target in dataloader:
            self.optimizer.zero_grad()
            pred = self.model(batch_input)
            loss = self.loss_fn(pred, batch_target)
            loss.backward()
            self.optimizer.step()
            total_loss += loss.item()
        return total_loss / len(dataloader)

    def train(self, train_data: tuple, epochs: int = 100, batch_size: int = 16) -> list:
        inputs, targets = train_data
        dataset = TensorDataset(inputs, targets)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        losses = []
        for _ in range(epochs):
            losses.append(self.train_epoch(loader))
        return losses

import torch
import torch.nn as nn


class FourierFeatureLayer(nn.Module):
    def __init__(self, in_features: int, num_frequencies: int = 128):
        super().__init__()
        self.B = nn.Parameter(torch.randn(in_features, num_frequencies), requires_grad=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x_proj = torch.matmul(x, self.B)
        return torch.cat([torch.sin(x_proj), torch.cos(x_proj)], dim=-1)


class SpectralConv2d(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, modes1: int, modes2: int):
        super().__init__()
        self.modes1 = modes1
        self.modes2 = modes2
        self.scale = 1 / (in_channels * out_channels)
        self.weights1 = nn.Parameter(self.scale * torch.rand(in_channels, out_channels, modes1, modes2, dtype=torch.cfloat))
        self.weights2 = nn.Parameter(self.scale * torch.rand(in_channels, out_channels, modes1, modes2, dtype=torch.cfloat))

    def compl_mul2d(self, a, b):
        return torch.einsum("bixy,ioxy->boxy", a, b)

    def forward(self, x):
        batchsize = x.shape[0]
        x_ft = torch.fft.rfft2(x)
        out_ft = torch.zeros(batchsize, self.weights1.shape[1], x.size(-2), x.size(-1) // 2 + 1, dtype=torch.cfloat, device=x.device)
        out_ft[:, :, :self.modes1, :self.modes2] = self.compl_mul2d(x_ft[:, :, :self.modes1, :self.modes2], self.weights1)
        out_ft[:, :, -self.modes1:, :self.modes2] = self.compl_mul2d(x_ft[:, :, -self.modes1:, :self.modes2], self.weights2)
        return torch.fft.irfft2(out_ft, s=(x.size(-2), x.size(-1)))


class PinnaSurrogate(nn.Module):
    def __init__(self, input_channels: int = 3, output_channels: int = 1, width: int = 64):
        super().__init__()
        self.fourier_features = FourierFeatureLayer(input_channels)
        self.encoder = nn.Sequential(
            nn.Linear(256, width),
            nn.GELU(),
            nn.Linear(width, width),
        )
        self.spectral1 = SpectralConv2d(width, width, 16, 16)
        self.spectral2 = SpectralConv2d(width, width, 16, 16)
        self.spectral3 = SpectralConv2d(width, width, 16, 16)
        self.decoder = nn.Sequential(
            nn.Conv2d(width, width, 1),
            nn.GELU(),
            nn.Conv2d(width, output_channels, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch, channels, h, w = x.shape
        x_flat = x.reshape(batch, channels, h * w).permute(0, 2, 1)
        x_fourier = self.fourier_features(x_flat)
        x_encoded = self.encoder(x_fourier)
        x_2d = x_encoded.permute(0, 2, 1).reshape(batch, -1, h, w)
        x_2d = torch.nn.functional.gelu(self.spectral1(x_2d))
        x_2d = torch.nn.functional.gelu(self.spectral2(x_2d))
        x_2d = self.spectral3(x_2d)
        return self.decoder(x_2d)

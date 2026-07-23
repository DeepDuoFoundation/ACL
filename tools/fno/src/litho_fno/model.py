import torch
import torch.nn as nn


class SpectralConv2d(nn.Module):
    def __init__(self, in_channels, out_channels, modes1, modes2):
        super().__init__()
        self.modes1 = modes1
        self.modes2 = modes2
        self.scale = 1 / (in_channels * out_channels)
        self.weights1 = nn.Parameter(self.scale * torch.rand(in_channels, out_channels, modes1, modes2, dtype=torch.cfloat))
        self.weights2 = nn.Parameter(self.scale * torch.rand(in_channels, out_channels, modes1, modes2, dtype=torch.cfloat))
        self.weights3 = nn.Parameter(self.scale * torch.rand(in_channels, out_channels, modes1, modes2, dtype=torch.cfloat))
        self.weights4 = nn.Parameter(self.scale * torch.rand(in_channels, out_channels, modes1, modes2, dtype=torch.cfloat))

    def compl_mul2d(self, a, b):
        return torch.einsum("bixy,ioxy->boxy", a, b)

    def forward(self, x):
        batchsize = x.shape[0]
        x_ft = torch.fft.rfft2(x)
        out_ft = torch.zeros(batchsize, self.weights1.shape[1], x.size(-2), x.size(-1) // 2 + 1, dtype=torch.cfloat, device=x.device)
        out_ft[:, :, :self.modes1, :self.modes2] = self.compl_mul2d(x_ft[:, :, :self.modes1, :self.modes2], self.weights1)
        out_ft[:, :, -self.modes1:, :self.modes2] = self.compl_mul2d(x_ft[:, :, -self.modes1:, :self.modes2], self.weights2)
        out_ft[:, :, :self.modes1, -self.modes2:] = self.compl_mul2d(x_ft[:, :, :self.modes1, -self.modes2:], self.weights3)
        out_ft[:, :, -self.modes1:, -self.modes2:] = self.compl_mul2d(x_ft[:, :, -self.modes1:, -self.modes2:], self.weights4)
        return torch.fft.irfft2(out_ft, s=(x.size(-2), x.size(-1)))


class FNO2d(nn.Module):
    def __init__(self, modes1=16, modes2=16, width=64, in_channels=3, out_channels=1):
        super().__init__()
        self.fc0 = nn.Linear(in_channels, width)
        self.spectral1 = SpectralConv2d(width, width, modes1, modes2)
        self.spectral2 = SpectralConv2d(width, width, modes1, modes2)
        self.spectral3 = SpectralConv2d(width, width, modes1, modes2)
        self.spectral4 = SpectralConv2d(width, width, modes1, modes2)
        self.w1 = nn.Conv2d(width, width, 1)
        self.w2 = nn.Conv2d(width, width, 1)
        self.w3 = nn.Conv2d(width, width, 1)
        self.w4 = nn.Conv2d(width, width, 1)
        self.fc1 = nn.Linear(width, width * 2)
        self.fc2 = nn.Linear(width * 2, out_channels)

    def forward(self, x):
        batchsize = x.shape[0]
        x = x.permute(0, 2, 3, 1)
        x = self.fc0(x)
        x = x.permute(0, 3, 1, 2)

        x1 = self.spectral1(x)
        x2 = self.w1(x)
        x = torch.nn.functional.gelu(x1 + x2)

        x1 = self.spectral2(x)
        x2 = self.w2(x)
        x = torch.nn.functional.gelu(x1 + x2)

        x1 = self.spectral3(x)
        x2 = self.w3(x)
        x = torch.nn.functional.gelu(x1 + x2)

        x1 = self.spectral4(x)
        x2 = self.w4(x)
        x = x1 + x2

        x = x.permute(0, 2, 3, 1)
        x = torch.nn.functional.gelu(self.fc1(x))
        x = self.fc2(x)
        x = x.permute(0, 3, 1, 2)
        return x

import torch
import pytest
from litho_fno.model import FNO2d


def test_fno_forward_pass():
    model = FNO2d(modes1=16, modes2=16, width=64)
    x = torch.randn(1, 3, 64, 64)
    output = model(x)
    assert output.shape == (1, 1, 64, 64)


def test_fno_resolution_invariance():
    model = FNO2d(modes1=16, modes2=16, width=64)
    model.eval()
    x32 = torch.randn(1, 3, 32, 32)
    x64 = torch.randn(1, 3, 64, 64)
    out32 = model(x32)
    out64 = model(x64)
    assert out32.shape == (1, 1, 32, 32)
    assert out64.shape == (1, 1, 64, 64)

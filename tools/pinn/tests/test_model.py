import torch
import pytest
from litho_pinn.model import PinnaSurrogate


def test_pinn_forward_pass():
    model = PinnaSurrogate(input_channels=3, output_channels=1)
    x = torch.randn(1, 3, 64, 64)
    output = model(x)
    assert output.shape == (1, 1, 64, 64)


def test_pinn_output_is_finite():
    model = PinnaSurrogate(input_channels=3, output_channels=1)
    x = torch.randn(2, 3, 32, 32)
    output = model(x)
    assert torch.isfinite(output).all()

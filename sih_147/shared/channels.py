"""Channel impairment models (used for realistic training & testing)."""

from __future__ import annotations

import numpy as np


def add_awgn(signal: np.ndarray, snr_db: float) -> np.ndarray:
    """Add Additive White Gaussian Noise to a complex signal."""
    if len(signal) == 0:
        return signal
    sig_power = np.mean(np.abs(signal) ** 2)
    snr_linear = 10.0 ** (snr_db / 10.0)
    noise_power = sig_power / snr_linear
    noise_std = np.sqrt(noise_power / 2.0)
    noise = noise_std * (np.random.randn(len(signal)) + 1j * np.random.randn(len(signal)))
    return (signal + noise).astype(np.complex64)


def add_frequency_offset(
    signal: np.ndarray,
    sample_rate: float,
    offset_hz: float,
) -> np.ndarray:
    """Add a constant frequency offset (carrier error)."""
    t = np.arange(len(signal), dtype=np.float64) / sample_rate
    mixer = np.exp(1j * 2 * np.pi * offset_hz * t)
    return (signal * mixer).astype(np.complex64)


def add_iq_imbalance(
    signal: np.ndarray,
    amplitude_imbalance_db: float = 0.0,
    phase_imbalance_deg: float = 0.0,
) -> np.ndarray:
    """Inject IQ amplitude and phase imbalance."""
    amp_ratio = 10.0 ** (amplitude_imbalance_db / 20.0)
    theta = np.deg2rad(phase_imbalance_deg)
    i = signal.real
    q = signal.imag
    q_imbal = amp_ratio * (-i * np.sin(theta) + q * np.cos(theta))
    return (i + 1j * q_imbal).astype(np.complex64)

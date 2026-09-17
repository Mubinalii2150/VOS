"""Synthetic signal generators for training and testing Member 4 & 5.

These produce known ground-truth bits so we can measure classification
accuracy and demodulation BER.
"""

from __future__ import annotations

import numpy as np
from .channels import add_awgn, add_frequency_offset


def generate_bpsk(
    num_symbols: int,
    symbol_rate: float,
    sample_rate: float,
    snr_db: float | None = None,
    freq_offset_hz: float = 0.0,
) -> tuple[np.ndarray, np.ndarray]:
    """Generate a BPSK signal. Returns (samples, bits)."""
    bits = np.random.randint(0, 2, num_symbols)
    symbols = 2 * bits - 1  # Map to -1, +1
    sps = int(sample_rate / symbol_rate)

    upsampled = np.zeros(num_symbols * sps)
    upsampled[::sps] = symbols

    # Raised-cosine pulse shaping
    num_taps = 6 * sps + 1
    t = np.arange(num_taps) - (num_taps - 1) // 2
    beta = 0.35
    rc = np.sinc(t / sps) * np.cos(np.pi * beta * t / sps) / (1 - (2 * beta * t / sps) ** 2 + 1e-10)
    sig = np.convolve(upsampled, rc, mode="same").astype(np.complex64)

    if freq_offset_hz != 0.0:
        sig = add_frequency_offset(sig, sample_rate, freq_offset_hz)
    if snr_db is not None:
        sig = add_awgn(sig, snr_db)
    return sig, bits


def generate_qpsk(
    num_symbols: int,
    symbol_rate: float,
    sample_rate: float,
    snr_db: float | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """Generate a QPSK signal. Returns (samples, bits)."""
    bits = np.random.randint(0, 2, num_symbols * 2)
    i_syms = 2 * bits[0::2] - 1
    q_syms = 2 * bits[1::2] - 1
    symbols = (i_syms + 1j * q_syms) / np.sqrt(2)

    sps = int(sample_rate / symbol_rate)
    upsampled = np.zeros(num_symbols * sps, dtype=np.complex128)
    upsampled[::sps] = symbols

    num_taps = 6 * sps + 1
    t = np.arange(num_taps) - (num_taps - 1) // 2
    beta = 0.35
    rc = np.sinc(t / sps) * np.cos(np.pi * beta * t / sps) / (1 - (2 * beta * t / sps) ** 2 + 1e-10)
    sig = np.convolve(upsampled, rc, mode="same").astype(np.complex64)

    if snr_db is not None:
        sig = add_awgn(sig, snr_db)
    return sig, bits


def generate_2fsk(
    num_symbols: int,
    symbol_rate: float,
    sample_rate: float,
    deviation_hz: float,
    snr_db: float | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """Generate continuous-phase 2-FSK. Returns (samples, bits)."""
    bits = np.random.randint(0, 2, num_symbols)
    symbols = 2 * bits - 1
    sps = int(sample_rate / symbol_rate)

    upsampled = np.repeat(symbols, sps)
    h = 2 * deviation_hz / symbol_rate
    phase_diff = upsampled * (np.pi * h / sps)
    phase = np.cumsum(phase_diff)
    sig = np.exp(1j * phase).astype(np.complex64)

    if snr_db is not None:
        sig = add_awgn(sig, snr_db)
    return sig, bits

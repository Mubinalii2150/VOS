from __future__ import annotations

import logging
from typing import Dict

import numpy as np

logger = logging.getLogger(__name__)


def analyze_signal_quality(sig: np.ndarray, sample_rate: float) -> Dict[str, float]:
    """Compute basic signal quality metrics.

    Returns dict with RMS Power, Peak Amplitude, Energy, Noise Floor, SNR (dB), Dynamic Range, DC Offset
    """
    x = sig
    # Work with magnitude for complex signals
    mag = np.abs(x)
    rms = float(np.sqrt(np.mean(mag ** 2)))
    peak = float(np.max(mag))
    energy = float(np.sum(mag ** 2))
    # Compute DC offset separately for real and imaginary parts to avoid ComplexWarning
    mean_val = np.mean(x)
    dc_offset_real = float(np.real(mean_val))
    dc_offset_imag = float(np.imag(mean_val)) if np.iscomplexobj(x) else 0.0

    # Estimate noise floor as median of lower 10% of magnitudes
    sorted_mag = np.sort(mag)
    idx = max(1, int(0.1 * len(sorted_mag)))
    noise_floor = float(np.median(sorted_mag[:idx]))

    # SNR: ratio of signal RMS to noise_floor (in dB). Avoid div by zero.
    snr = 20.0 * np.log10(rms / (noise_floor + 1e-12))

    # Dynamic range: peak to noise floor (dB)
    dynamic_range = 20.0 * np.log10((peak + 1e-12) / (noise_floor + 1e-12))

    return {
        "rms_power": rms,
        "peak_amplitude": peak,
        "energy": energy,
        "noise_floor": noise_floor,
        "snr_db": float(snr),
        "dynamic_range_db": float(dynamic_range),
        "dc_offset_real": dc_offset_real,
        "dc_offset_imag": dc_offset_imag,
    }

from __future__ import annotations

import logging
import os
from typing import Dict, Tuple

import numpy as np
from scipy import fftpack

logger = logging.getLogger(__name__)


def analyze_spectrum(sig: np.ndarray, sample_rate: float, output_dir: str = "output") -> Dict[str, float]:
    """Compute FFT-based spectrum features and save FFT array to out_dir/fft.npy

    Returns a dict with dominant_freq, peak_freq, centre_freq, occupied_bandwidth, total_power
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    x = sig
    # Use magnitude spectrum
    N = len(x)
    windowed = x * np.hanning(N)
    spectrum = fftpack.fft(windowed)
    freqs = fftpack.fftfreq(N, d=1.0 / sample_rate)
    mags = np.abs(spectrum)

    # Only positive freqs
    pos = freqs >= 0
    freqs_p = freqs[pos]
    mags_p = mags[pos]

    total_power = float(np.sum(mags_p ** 2))
    peak_idx = int(np.argmax(mags_p))
    peak_freq = float(freqs_p[peak_idx])

    # Centre frequency: power-weighted centroid
    centre_freq = float(np.sum(freqs_p * (mags_p ** 2)) / (np.sum(mags_p ** 2) + 1e-12))

    # Dominant frequency (max magnitude)
    dominant_freq = peak_freq

    # Occupied bandwidth: bandwidth containing 90% of power
    cum_power = np.cumsum(mags_p ** 2)
    p90 = 0.9 * cum_power[-1]
    left = np.searchsorted(cum_power, 0.05 * cum_power[-1])
    right = np.searchsorted(cum_power, p90)
    occupied_bw = float(freqs_p[right] - freqs_p[left]) if right > left else 0.0

    # Save FFT magnitude array
    np.save(os.path.join(output_dir, "fft.npy"), mags_p)

    return {
        "dominant_freq": float(dominant_freq),
        "peak_freq": float(peak_freq),
        "centre_freq": float(centre_freq),
        "occupied_bandwidth": float(occupied_bw),
        "total_spectral_power": float(total_power),
    }

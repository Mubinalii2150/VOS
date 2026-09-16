from __future__ import annotations

import logging
from typing import Dict

import numpy as np
from scipy import stats

logger = logging.getLogger(__name__)


def spectral_entropy(power_spectrum: np.ndarray) -> float:
    p = power_spectrum / (np.sum(power_spectrum) + 1e-12)
    return float(-np.sum(p * np.log2(p + 1e-12)))


def spectral_flatness(power_spectrum: np.ndarray) -> float:
    # Geometric mean / arithmetic mean
    gm = np.exp(np.mean(np.log(power_spectrum + 1e-12)))
    am = np.mean(power_spectrum + 1e-12)
    return float(gm / am)


def extract_advanced_features(sig: np.ndarray, sample_rate: float, spectrum_info: Dict[str, float]) -> Dict[str, float]:
    """Return a dict of advanced ML-ready features.

    Features: RMS, Peak, Energy, Bandwidth, Spectral Entropy, Centroid, Flatness, ZCR, Crest Factor, Roll-off, Dominant Freq, Mean Power
    """
    x = sig
    mag = np.abs(x)
    rms = float(np.sqrt(np.mean(mag ** 2)))
    peak = float(np.max(mag))
    energy = float(np.sum(mag ** 2))

    # Bandwidth from spectrum_info
    bandwidth = float(spectrum_info.get("occupied_bandwidth", 0.0))

    # Compute power spectrum for entropy/centroid/flatness
    # Use FFT magnitude squared. Use full FFT for complex signals, rFFT for real signals.
    N = len(x)
    if N <= 0:
        logger.warning("Empty signal passed to extract_advanced_features")
        freqs = np.array([])
        spec = np.array([])
    else:
        windowed = x * np.hanning(N)
        if np.iscomplexobj(windowed):
            # Full FFT for complex signals; take only the non-negative frequencies
            full_spec = np.abs(np.fft.fft(windowed)) ** 2
            freqs_full = np.fft.fftfreq(N, d=1.0 / sample_rate)
            pos = freqs_full >= 0
            freqs = freqs_full[pos]
            spec = full_spec[pos]
        else:
            # Real signal: use rFFT which returns non-negative frequencies
            spec = np.abs(np.fft.rfft(windowed)) ** 2
            freqs = np.fft.rfftfreq(N, d=1.0 / sample_rate)

    cent = float(np.sum(freqs * spec) / (np.sum(spec) + 1e-12)) if spec.size and spec.sum() > 0 else 0.0
    ent = spectral_entropy(spec) if spec.size else 0.0
    flat = spectral_flatness(spec) if spec.size else 0.0

    # Zero-crossing rate (on real part)
    real = np.real(x)
    zc = float(((real[:-1] * real[1:]) < 0).sum() / len(real))

    crest = float(peak / (rms + 1e-12))

    # Spectral roll-off (85%)
    cum = np.cumsum(spec)
    roll_threshold = 0.85 * cum[-1] if cum[-1] > 0 else 0.0
    roll_idx = int(np.searchsorted(cum, roll_threshold)) if roll_threshold > 0 else 0
    rolloff = float(freqs[min(roll_idx, len(freqs) - 1)]) if freqs.size else 0.0

    dom_freq = float(spectrum_info.get("dominant_freq", 0.0))
    mean_power = float(np.mean(spec))

    return {
        "rms": rms,
        "peak": peak,
        "energy": energy,
        "bandwidth": bandwidth,
        "spectral_entropy": ent,
        "spectral_centroid": cent,
        "spectral_flatness": flat,
        "zero_crossing_rate": zc,
        "crest_factor": crest,
        "spectral_rolloff": rolloff,
        "dominant_frequency": dom_freq,
        "mean_power": mean_power,
    }

from __future__ import annotations
from dataclasses import dataclass, field
import numpy as np
from scipy import signal as sp_signal
from scipy.stats import kurtosis, skew

@dataclass
class FeatureVector:
    """Named feature vector for one signal segment."""
    values: np.ndarray          # 1-D float32
    names: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, float]:
        return {n: float(v) for n, v in zip(self.names, self.values)}


def _safe_std(x: np.ndarray) -> float:
    s = float(np.std(x))
    return s if s > 1e-12 else 1e-12


def extract_features(
    samples: np.ndarray,
    sample_rate: float,
    fft_size: int = 1024,
) -> FeatureVector:
    
    if len(samples) < 64:
        samples = np.pad(samples, (0, 64 - len(samples)))

    x = samples.astype(np.complex64)
    n = len(x)

    # ----- Instantaneous amplitude / phase / frequency -----
    amp = np.abs(x)
    amp = amp / (np.mean(amp) + 1e-12)          # scale-invariant
    phase = np.unwrap(np.angle(x))
    inst_freq = np.diff(phase)
    inst_freq = np.append(inst_freq, inst_freq[-1])

    amp_mean = float(np.mean(amp))
    amp_std = _safe_std(amp)
    amp_skew = float(skew(amp))
    amp_kurt = float(kurtosis(amp))
    amp_peak = float(np.max(amp))
    amp_rms = float(np.sqrt(np.mean(amp ** 2)))
    crest_factor = amp_peak / (amp_rms + 1e-12)

    freq_std = _safe_std(inst_freq)
    freq_kurt = float(kurtosis(inst_freq))

    
    power = np.mean(np.abs(x) ** 2) + 1e-12
    xn = x / np.sqrt(power)

    m20 = np.mean(xn ** 2)
    m21 = np.mean(xn * np.conj(xn))
    m22 = np.mean(np.abs(xn) ** 4)
    m40 = np.mean(xn ** 4)
    m42 = np.mean(xn ** 2 * np.conj(xn) ** 2)

    c20 = m20
    c40 = m40 - 3 * m20 ** 2
    c42 = m42 - np.abs(m20) ** 2 - 2 * m21 ** 2

    
    nfft = min(fft_size, n)
    freqs, psd = sp_signal.welch(
        xn, fs=sample_rate, nperseg=nfft, noverlap=nfft // 2,
        return_onesided=False, detrend=False,
    )
    psd = np.fft.fftshift(np.maximum(psd, 1e-30))
    freqs = np.fft.fftshift(freqs)
    psd_norm = psd / (np.sum(psd) + 1e-30)

    spectral_centroid = float(np.sum(freqs * psd_norm))
    spectral_bw = float(np.sqrt(np.sum(((freqs - spectral_centroid) ** 2) * psd_norm)))
    spectral_flatness = float(
        np.exp(np.mean(np.log(psd + 1e-30))) / (np.mean(psd) + 1e-30)
    )
    peak_to_avg = float(np.max(psd) / (np.mean(psd) + 1e-30))
    occupied_bw_frac = float(np.sum(psd > 0.01 * np.max(psd)) / len(psd))

    
    amp_ac = amp - np.mean(amp)
    env_fft = np.abs(np.fft.rfft(amp_ac * sp_signal.windows.hann(len(amp_ac))))
    env_fft = env_fft / (np.max(env_fft) + 1e-12)
    env_peak = float(np.max(env_fft[2:])) if len(env_fft) > 5 else 0.0

    
    names = [
        "amp_mean", "amp_std", "amp_skew", "amp_kurt", "crest_factor",
        "freq_std", "freq_kurt",
        "c20_real", "c20_imag", "c40_real", "c40_imag", "c42_real",
        "m22", "spectral_centroid_norm", "spectral_bw_norm",
        "spectral_flatness", "peak_to_avg", "occupied_bw_frac",
        "env_peak_strength", "iq_corr",
    ]

    sc_norm = spectral_centroid / (sample_rate / 2 + 1e-12)
    sb_norm = spectral_bw / (sample_rate / 2 + 1e-12)
    iq_corr = float(np.mean(x.real * x.imag))

    values = np.array([
        amp_mean, amp_std, amp_skew, amp_kurt, crest_factor,
        freq_std, freq_kurt,
        float(np.real(c20)), float(np.imag(c20)),
        float(np.real(c40)), float(np.imag(c40)),
        float(np.real(c42)),
        float(np.real(m22)),
        sc_norm, sb_norm,
        spectral_flatness, peak_to_avg, occupied_bw_frac,
        env_peak, iq_corr,
    ], dtype=np.float32)

    values = np.nan_to_num(values, nan=0.0, posinf=0.0, neginf=0.0)
    return FeatureVector(values=values, names=names)

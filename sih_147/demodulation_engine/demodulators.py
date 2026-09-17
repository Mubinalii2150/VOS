from __future__ import annotations
import sys
from dataclasses import dataclass, field
from pathlib import Path
import numpy as np
from scipy import signal as sp_signal


_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.enums import ModulationType


@dataclass
class DemodResult:
    """Everything Member 6 and the GUI need after demodulation."""
    bits: np.ndarray
    symbols: np.ndarray = field(default_factory=lambda: np.array([], dtype=np.complex64))
    modulation: str = "Unknown"
    symbol_rate_hz: float = 0.0
    carrier_offset_hz: float = 0.0
    snr_db: float = 0.0
    num_symbols: int = 0
    metrics: dict = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)



# Shared helpers
def _estimate_sps(sample_rate: float, symbol_rate: float) -> int:
    return max(2, int(round(sample_rate / symbol_rate)))


def _match_filter(samples: np.ndarray, sps: int, beta: float = 0.35) -> np.ndarray:
    """Raised-cosine matched filter."""
    num_taps = 6 * sps + 1
    t = np.arange(num_taps) - (num_taps - 1) // 2
    denom = 1 - (2 * beta * t / sps) ** 2
    denom = np.where(np.abs(denom) < 1e-8, 1e-8, denom)
    rc = np.sinc(t / sps) * np.cos(np.pi * beta * t / sps) / denom
    rc = rc / np.sum(rc)
    filtered = sp_signal.lfilter(rc, 1.0, samples)
    delay = (num_taps - 1) // 2
    return filtered[delay:].astype(np.complex64)


def _best_timing(samples: np.ndarray, sps: int) -> tuple[np.ndarray, float]:
    """Open-loop timing: pick the sampling phase with highest symbol energy."""
    best_power, best_offset = -1.0, 0
    for offset in range(sps):
        syms = samples[offset::sps]
        power = float(np.mean(np.abs(syms) ** 2))
        if power > best_power:
            best_power, best_offset = power, offset
    return samples[best_offset::sps].astype(np.complex64), float(best_offset)


def _carrier_recovery_psk(samples: np.ndarray, order: int = 2) -> tuple[np.ndarray, float]:
    """M-th power carrier recovery for PSK."""
    wiped = samples ** order
    n = min(len(wiped), 4096)
    window = sp_signal.windows.hann(n)
    spec = np.fft.fftshift(np.fft.fft(wiped[:n] * window))
    freqs = np.fft.fftshift(np.fft.fftfreq(n))
    peak_idx = int(np.argmax(np.abs(spec)))
    est_freq_norm = float(freqs[peak_idx]) / order

    n_full = np.arange(len(samples), dtype=np.float64)
    mixer = np.exp(-1j * 2 * np.pi * est_freq_norm * n_full)
    corrected = (samples * mixer).astype(np.complex64)

    avg_phase = float(np.angle(np.mean(
        wiped[:n] * np.exp(-1j * 2 * np.pi * freqs[peak_idx] * np.arange(n))
    )))
    residual_phase = avg_phase / order
    corrected = (corrected * np.exp(-1j * residual_phase)).astype(np.complex64)
    return corrected, residual_phase


def _estimate_snr(samples: np.ndarray) -> float:
    """Simple M2M4 SNR estimate."""
    if len(samples) == 0:
        return 0.0
    m2 = np.mean(np.abs(samples) ** 2)
    m4 = np.mean(np.abs(samples) ** 4)
    if m2 == 0 or m4 >= 2 * m2 ** 2:
        return 0.0
    sqrt_term = np.sqrt(max(0, 2 * m2 ** 2 - m4))
    noise_power = m2 - sqrt_term
    if noise_power <= 0:
        return 100.0
    return float(10 * np.log10(sqrt_term / noise_power))


def _remove_dc_norm(samples: np.ndarray) -> np.ndarray:
    samples = samples - np.mean(samples)
    rms = np.sqrt(np.mean(np.abs(samples) ** 2))
    if rms > 0:
        samples = samples / rms
    return samples.astype(np.complex64)



# BPSK


def demod_bpsk(
    samples: np.ndarray,
    sample_rate: float,
    symbol_rate: float,
) -> DemodResult:
    if len(samples) < 64:
        raise ValueError("Need ≥ 64 samples for BPSK demod")

    samples = _remove_dc_norm(samples)
    sps = _estimate_sps(sample_rate, symbol_rate)
    samples = _match_filter(samples, sps)
    samples, phase = _carrier_recovery_psk(samples, order=2)
    symbols, timing_offset = _best_timing(samples, sps)
    bits = (np.real(symbols) > 0).astype(np.uint8)

    return DemodResult(
        bits=bits,
        symbols=symbols,
        modulation=ModulationType.BPSK.value,
        symbol_rate_hz=symbol_rate,
        snr_db=_estimate_snr(samples),
        num_symbols=len(bits),
        metrics={"timing_offset": timing_offset, "residual_phase": phase, "sps": sps},
    )



# QPSK

def demod_qpsk(
    samples: np.ndarray,
    sample_rate: float,
    symbol_rate: float,
) -> DemodResult:
    if len(samples) < 64:
        raise ValueError("Need ≥ 64 samples for QPSK demod")

    samples = _remove_dc_norm(samples)
    sps = _estimate_sps(sample_rate, symbol_rate)
    samples = _match_filter(samples, sps)
    samples, phase = _carrier_recovery_psk(samples, order=4)
    symbols, timing_offset = _best_timing(samples, sps)

    i_bits = (np.real(symbols) > 0).astype(np.uint8)
    q_bits = (np.imag(symbols) > 0).astype(np.uint8)
    bits = np.empty(len(symbols) * 2, dtype=np.uint8)
    bits[0::2] = i_bits
    bits[1::2] = q_bits

    return DemodResult(
        bits=bits,
        symbols=symbols,
        modulation=ModulationType.QPSK.value,
        symbol_rate_hz=symbol_rate,
        snr_db=_estimate_snr(samples),
        num_symbols=len(symbols),
        metrics={"timing_offset": timing_offset, "residual_phase": phase, "sps": sps},
    )


# 2-FSK

def demod_2fsk(
    samples: np.ndarray,
    sample_rate: float,
    symbol_rate: float,
    deviation_hz: float | None = None,
) -> DemodResult:
    if len(samples) < 64:
        raise ValueError("Need ≥ 64 samples for 2-FSK demod")

    samples = _remove_dc_norm(samples)
    if deviation_hz is None:
        deviation_hz = symbol_rate * 0.35
    sps = _estimate_sps(sample_rate, symbol_rate)

    phase = np.unwrap(np.angle(samples))
    inst_freq = np.diff(phase) / (2 * np.pi) * sample_rate
    inst_freq = np.append(inst_freq, inst_freq[-1])

    cutoff = min(symbol_rate * 1.5, sample_rate * 0.4)
    b, a = sp_signal.butter(2, cutoff / (sample_rate / 2), btype="low")
    inst_freq_f = sp_signal.lfilter(b, a, inst_freq)

    offset = sps // 2
    freq_samples = inst_freq_f[offset::sps]
    freq_samples = freq_samples - np.mean(freq_samples)
    bits = (freq_samples > 0).astype(np.uint8)

    return DemodResult(
        bits=bits,
        symbols=freq_samples.astype(np.complex64),
        modulation=ModulationType.FSK2.value,
        symbol_rate_hz=symbol_rate,
        snr_db=_estimate_snr(samples),
        num_symbols=len(bits),
        metrics={"deviation_hz": deviation_hz, "sps": sps},
    )



# Dispatcher (the only function the rest of the system needs to call)

def demodulate(
    samples: np.ndarray,
    sample_rate: float,
    modulation: str,
    symbol_rate: float,
    **kwargs,
) -> DemodResult:
    
    if symbol_rate <= 0:
        symbol_rate = sample_rate / 20.0

    mod = modulation.upper().replace(" ", "")
    if mod in ("BPSK",):
        return demod_bpsk(samples, sample_rate, symbol_rate, **kwargs)
    if mod in ("QPSK",):
        return demod_qpsk(samples, sample_rate, symbol_rate, **kwargs)
    if mod in ("2-FSK", "2FSK", "FSK2", "GFSK", "MSK"):
        return demod_2fsk(samples, sample_rate, symbol_rate, **kwargs)

    raise ValueError(
        f"No demodulator for '{modulation}'. "
        "Supported: BPSK, QPSK, 2-FSK."
    )

import os
import numpy as np

def analyze_spectrum(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    # IQ → complex, WAV → float
    x = signal.astype(np.complex64) if np.iscomplexobj(signal) else signal.astype(np.float32)

    N = len(x)

    # Window
    window = np.hanning(N)
    spectrum = np.fft.fft(x * window)

    freqs = np.fft.fftfreq(N, d=1 / sample_rate)

    power = np.abs(spectrum) ** 2

    # Positive spectrum only
    mask = freqs >= 0
    freqs = freqs[mask]
    power = power[mask]

    # Dominant Frequency
    peak_idx = np.argmax(power)
    dominant_freq = float(freqs[peak_idx])

    # Center Frequency (Power Weighted)
    center_freq = float(
        np.sum(freqs * power) / (np.sum(power) + 1e-12)
    )

    # 90% Occupied Bandwidth
    cumulative = np.cumsum(power)
    total = cumulative[-1]

    left = np.searchsorted(cumulative, total * 0.05)
    right = np.searchsorted(cumulative, total * 0.95)

    occupied_bw = float(freqs[right] - freqs[left])

    # Save FFT
    np.save(os.path.join(output_dir, "fft.npy"), power)

    return {
        "dominant_freq": dominant_freq,
        "peak_freq": dominant_freq,
        "centre_freq": center_freq,
        "occupied_bandwidth": occupied_bw,
        "total_spectral_power": float(np.sum(power)),
    }
import os
import numpy as np
import matplotlib

# GUI OFF
matplotlib.use("Agg")

import matplotlib.pyplot as plt
from scipy.signal import spectrogram


# -----------------------------
# Utility
# -----------------------------
def _prepare(signal):
    """Convert complex IQ to magnitude + remove NaN"""
    if np.iscomplexobj(signal):
        signal = np.abs(signal)

    signal = np.nan_to_num(signal).astype(np.float32)

    if len(signal) > 250000:
        signal = signal[:250000]

    return signal


# -----------------------------
# Spectrogram
# -----------------------------
def generate_spectrogram(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    signal = _prepare(signal)

    f, t, Sxx = spectrogram(
        signal,
        fs=sample_rate,
        window="hann",
        nperseg=1024,
        noverlap=768,
        mode="magnitude",
    )

    Sxx = 20 * np.log10(Sxx + 1e-12)

    fig, ax = plt.subplots(figsize=(12, 5), dpi=180)

    ax.pcolormesh(
        t,
        f / 1e6,
        Sxx,
        shading="gouraud",
        cmap="viridis",
    )

    ax.set_title("RF Spectrogram")
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Frequency (MHz)")

    path = os.path.join(output_dir, "spectrogram.png")
    fig.tight_layout()
    fig.savefig(path)
    plt.close("all")

    return path


# -----------------------------
# FFT
# -----------------------------
def generate_fft_spectrum(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    signal = _prepare(signal)

    N = len(signal)

    window = np.hanning(N)
    fft = np.abs(np.fft.rfft(signal * window))

    freq = np.fft.rfftfreq(N, d=1 / sample_rate)

    fig, ax = plt.subplots(figsize=(10, 4), dpi=180)

    ax.plot(freq / 1e6, fft, color="#39FF14", linewidth=1)

    ax.set_title("FFT Spectrum")
    ax.set_xlabel("Frequency (MHz)")
    ax.set_ylabel("Magnitude")
    ax.grid(alpha=.3)

    path = os.path.join(output_dir, "fft_spectrum.png")
    fig.tight_layout()
    fig.savefig(path)
    plt.close("all")

    return path


# -----------------------------
# Waveform
# -----------------------------
def generate_waveform_plot(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    signal = _prepare(signal)

    t = np.arange(len(signal)) / sample_rate

    fig, ax = plt.subplots(figsize=(10, 3), dpi=180)

    ax.plot(t * 1000, signal, color="cyan", linewidth=.8)

    ax.set_title("Waveform")
    ax.set_xlabel("Time (ms)")
    ax.set_ylabel("Amplitude")

    path = os.path.join(output_dir, "waveform.png")
    fig.tight_layout()
    fig.savefig(path)
    plt.close("all")

    return path


# -----------------------------
# Waterfall
# -----------------------------
def generate_waterfall_image(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    signal = _prepare(signal)

    f, t, Sxx = spectrogram(
        signal,
        fs=sample_rate,
        window="hann",
        nperseg=1024,
        noverlap=768,
        mode="magnitude",
    )

    Sxx = 10 * np.log10(Sxx + 1e-12)

    fig, ax = plt.subplots(figsize=(10, 6), dpi=180)

    ax.imshow(
        Sxx,
        aspect="auto",
        origin="lower",
        cmap="turbo",
        extent=[t.min(), t.max(), f.min()/1e6, f.max()/1e6],
    )

    ax.set_title("RF Waterfall")
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Frequency (MHz)")

    path = os.path.join(output_dir, "waterfall.png")
    fig.tight_layout()
    fig.savefig(path)
    plt.close("all")

    return path
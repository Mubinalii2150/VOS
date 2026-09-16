import os
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import spectrogram

def generate_spectrogram(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    # Complex IQ -> magnitude
    if np.iscomplexobj(signal):
        signal = np.abs(signal)

    f, t, Sxx = spectrogram(
        signal,
        fs=sample_rate,
        window="hann",
        nperseg=1024,
        noverlap=768,
        scaling="density",
        mode="magnitude"
    )

    Sxx_db = 20 * np.log10(Sxx + 1e-12)

    vmax = np.max(Sxx_db)
    vmin = vmax - 70

    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(14,6))

    img = ax.pcolormesh(
        t,
        f,
        Sxx_db,
        shading="gouraud",
        cmap="viridis",
        vmin=vmin,
        vmax=vmax
    )

    ax.set_title("RF Spectrogram Analysis", color="white", fontsize=16)
    ax.set_xlabel("Time [sec]", color="white")
    ax.set_ylabel("Frequency [Hz]", color="white")

    cbar = fig.colorbar(img, ax=ax)
    cbar.set_label("Power [dB]", color="white")
    cbar.ax.yaxis.set_tick_params(color="white")
    plt.setp(cbar.ax.get_yticklabels(), color="white")

    path = os.path.join(output_dir, "spectrogram.png")
    plt.tight_layout()
    plt.savefig(path, dpi=300, facecolor="black")
    plt.close()

    return path


def generate_fft_spectrum(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    x = signal
    N = len(x)
    if N == 0:
        raise ValueError("Empty signal")

    windowed = x * np.hanning(N)
    if np.iscomplexobj(windowed):
        spectrum = np.abs(np.fft.fft(windowed)) ** 2
        freqs = np.fft.fftfreq(N, d=1.0 / sample_rate)
        pos = freqs >= 0
        freqs = freqs[pos]
        spectrum = spectrum[pos]
    else:
        spectrum = np.abs(np.fft.rfft(windowed)) ** 2
        freqs = np.fft.rfftfreq(N, d=1.0 / sample_rate)

    Sxx_db = 10 * np.log10(spectrum + 1e-12)

    fig, ax = plt.subplots(figsize=(10, 4), dpi=300)
    fig.patch.set_facecolor('#05070A')
    ax.set_facecolor('#05070A')
    ax.plot(freqs, Sxx_db, color="#39FF14", linewidth=1.0)

    peak_idx = int(np.argmax(spectrum))
    peak_freq = float(freqs[peak_idx])
    peak_val = float(Sxx_db[peak_idx])
    ax.scatter([peak_freq], [peak_val], color="#FFEA00")
    ax.annotate(f"Peak: {peak_freq:.2f} Hz", xy=(peak_freq, peak_val), xytext=(10, 10), textcoords='offset points', color='white')

    ax.set_xlabel("Frequency (Hz)", color='white')
    ax.set_ylabel("Power (dB)", color='white')
    ax.set_title("RF Frequency Spectrum", color='white')
    ax.grid(True, color='#2A2A2A')
    for label in ax.get_xticklabels() + ax.get_yticklabels():
        label.set_color('white')

    out_path = os.path.join(output_dir, "fft_spectrum.png")
    fig.tight_layout()
    fig.savefig(out_path, dpi=300, facecolor=fig.get_facecolor())
    plt.close(fig)
    return out_path


def generate_waterfall_image(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    nperseg = 1024
    noverlap = int(nperseg * 0.75)
    proc_sig = np.abs(signal) if np.iscomplexobj(signal) else signal
    f, t, Sxx = spectrogram(proc_sig, fs=sample_rate, window='hann', nperseg=nperseg, noverlap=noverlap, scaling='density', mode='magnitude')
    Sxx_db = 10 * np.log10(Sxx + 1e-12)
    vmax = np.max(Sxx_db)
    vmin = vmax - 70.0

    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    fig.patch.set_facecolor('#05070A')
    ax.set_facecolor('#05070A')
    im = ax.pcolormesh(f, t, Sxx_db.T, shading='gouraud', cmap='turbo', vmin=vmin, vmax=vmax)
    ax.set_xlabel('Frequency (Hz)', color='white')
    ax.set_ylabel('Time (s)', color='white')
    ax.set_title('Waterfall', color='white')
    cbar = fig.colorbar(im, ax=ax)
    cbar.set_label('Power (dB)', color='white')
    for tlabel in cbar.ax.get_yticklabels():
        tlabel.set_color('white')
    for label in ax.get_xticklabels() + ax.get_yticklabels():
        label.set_color('white')

    out_path = os.path.join(output_dir, "waterfall.png")
    fig.tight_layout()
    fig.savefig(out_path, dpi=300, facecolor=fig.get_facecolor())
    plt.close(fig)
    return out_path


def generate_waveform_plot(signal, sample_rate, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    x = np.real(signal) if np.iscomplexobj(signal) else signal
    t = np.arange(len(x)) / float(sample_rate)

    fig, ax = plt.subplots(figsize=(10, 3), dpi=300)
    fig.patch.set_facecolor('black')
    ax.set_facecolor('black')
    ax.plot(t * 1000.0, x, color='cyan', linewidth=0.8)
    ax.set_xlabel('Time (ms)', color='white')
    ax.set_ylabel('Amplitude', color='white')
    ax.set_title('Waveform', color='white')
    for label in ax.get_xticklabels() + ax.get_yticklabels():
        label.set_color('white')

    out_path = os.path.join(output_dir, "waveform.png")
    fig.tight_layout()
    fig.savefig(out_path, dpi=300, facecolor=fig.get_facecolor())
    plt.close(fig)
    return out_path
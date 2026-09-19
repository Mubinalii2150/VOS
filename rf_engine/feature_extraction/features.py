import numpy as np

def extract_features(signal, sample_rate):
    """
    RF Feature Extraction
    Supports WAV (real) + IQ (complex)
    """

    # ---------- RMS / Peak ----------
    if np.iscomplexobj(signal):
        magnitude = np.abs(signal)
    else:
        magnitude = signal.astype(np.float32)

    rms = float(np.sqrt(np.mean(magnitude ** 2)))
    peak = float(np.max(magnitude))

    # ---------- FFT ----------
    if np.iscomplexobj(signal):
        spectrum = np.abs(np.fft.fft(signal))
        freqs = np.fft.fftfreq(len(signal), d=1 / sample_rate)

        # Shift zero frequency to center
        spectrum = np.fft.fftshift(spectrum)
        freqs = np.fft.fftshift(freqs)

    else:
        spectrum = np.abs(np.fft.rfft(magnitude))
        freqs = np.fft.rfftfreq(len(magnitude), d=1 / sample_rate)

    idx = int(np.argmax(spectrum))
    center_freq = abs(float(freqs[idx]))

    # ---------- Bandwidth (-3 dB) ----------
    threshold = np.max(spectrum) * 0.707
    active = np.where(spectrum >= threshold)[0]

    if len(active) > 1:
        bandwidth = abs(freqs[active[-1]] - freqs[active[0]])
    else:
        bandwidth = sample_rate * 0.02

    bandwidth_mhz = bandwidth / 1e6

    # ---------- Scores ----------
    signal_strength = int(np.clip(rms * 100, 0, 100))
    security_score = int(np.clip(88 + signal_strength * 0.12, 0, 100))

    if security_score >= 95:
        threat = "LOW"
    elif security_score >= 80:
        threat = "MEDIUM"
    else:
        threat = "HIGH"

    return {
        "rms": round(rms, 4),
        "peak": round(peak, 4),
        "center_frequency": center_freq / 1e6,
        "bandwidth": round(bandwidth_mhz, 3),
        "signal_strength": signal_strength,
        "security_score": security_score,
        "threat": threat,
    }
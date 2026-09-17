import numpy as np
import matplotlib.pyplot as plt
import os

# =========================
# INPUT
# =========================

filename = "output/processed_iq.npy"

if not os.path.exists(filename):
    raise FileNotFoundError("processed_iq.npy not found.")

iq_signal = np.load(filename)

print("===== WATERFALL / SPECTROGRAM =====")
print("IQ Samples:", len(iq_signal))

# Sample rate of the original WAV
sample_rate = 44100

# =========================
# SPECTROGRAM
# =========================

plt.figure(figsize=(12, 6))

plt.specgram(
    iq_signal,
    NFFT=1024,
    Fs=sample_rate,
    noverlap=512
)

plt.title("Signal Waterfall / Spectrogram")
plt.xlabel("Time (seconds)")
plt.ylabel("Frequency (Hz)")

plt.colorbar(label="Power")
plt.tight_layout()
plt.show()

# =========================
# SAVE
# =========================

os.makedirs("output", exist_ok=True)

plt.savefig("output/waterfall.png", dpi=150)

print("--------------------------------")
print("Waterfall Analysis Complete")
print("Graph saved as: output/waterfall.png")
print("--------------------------------")
import numpy as np
import matplotlib.pyplot as plt
import os

# =========================
# INPUT
# =========================

filename = "output/test_fsk.npy"

if not os.path.exists(filename):
    raise FileNotFoundError("test_fsk.npy not found.")

signal = np.load(filename)

print("===== FSK ANALYSIS =====")
print("Total Samples:", len(signal))

# =========================
# PARAMETERS
# =========================

sample_rate = 10000

# =========================
# FFT
# =========================

N = len(signal)

fft_result = np.fft.fft(signal)

frequencies = np.fft.fftfreq(
    N,
    d=1 / sample_rate
)

magnitude = np.abs(fft_result)

# Only positive frequencies
positive = frequencies >= 0

freq = frequencies[positive]
mag = magnitude[positive]

# =========================
# FIND STRONG FREQUENCIES
# =========================

# Ignore DC
valid = freq > 100

freq = freq[valid]
mag = mag[valid]

# Get strongest frequency components
indices = np.argsort(mag)[-10:]

strong_freqs = freq[indices]
strong_mags = mag[indices]

# Sort by frequency
order = np.argsort(strong_freqs)

strong_freqs = strong_freqs[order]
strong_mags = strong_mags[order]

print("\nStrong Frequency Components:")

for f, m in zip(strong_freqs, strong_mags):
    print(
        round(f, 2),
        "Hz  Magnitude:",
        round(m, 2)
    )

# =========================
# PLOT
# =========================

plt.figure(figsize=(12, 5))

plt.plot(freq, mag)

plt.title("FSK Frequency Spectrum")
plt.xlabel("Frequency (Hz)")
plt.ylabel("Magnitude")
plt.grid()

plt.tight_layout()
plt.show()

# =========================
# SAVE
# =========================

os.makedirs("output", exist_ok=True)

plt.savefig(
    "output/fsk_spectrum.png",
    dpi=150
)

print("\n--------------------------------")
print("FSK Analysis Complete")
print("Graph saved:")
print("output/fsk_spectrum.png")
print("--------------------------------")
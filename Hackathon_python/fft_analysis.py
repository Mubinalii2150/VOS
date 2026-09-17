import numpy as np
import matplotlib.pyplot as plt
import os

# =========================
# INPUT
# =========================

filename = "output/processed_iq.npy"

if not os.path.exists(filename):
    raise FileNotFoundError("processed_iq.npy not found.")

# Load IQ signal
iq_signal = np.load(filename)

print("===== FFT ANALYSIS =====")
print("Total IQ Samples:", len(iq_signal))

# =========================
# SAMPLE RATE
# =========================

# signal.wav ka sample rate = 44100 Hz
sample_rate = 44100

# =========================
# FFT
# =========================

N = len(iq_signal)

fft_result = np.fft.fft(iq_signal)

# Frequency axis
frequencies = np.fft.fftfreq(N, d=1 / sample_rate)

# Shift zero frequency to center
fft_shifted = np.fft.fftshift(fft_result)
freq_shifted = np.fft.fftshift(frequencies)

# Magnitude
magnitude = np.abs(fft_shifted)

# Convert to dB
magnitude_db = 20 * np.log10(magnitude + 1e-12)

# =========================
# DOMINANT FREQUENCY
# =========================

peak_index = np.argmax(magnitude)

dominant_frequency = freq_shifted[peak_index]

print("\n===== FREQUENCY RESULT =====")
print(
    "Dominant Frequency:",
    round(abs(dominant_frequency), 2),
    "Hz"
)

# =========================
# BANDWIDTH ESTIMATION
# =========================

# Threshold = peak - 3 dB
peak_db = np.max(magnitude_db)
threshold = peak_db - 3

indices = np.where(magnitude_db >= threshold)[0]

if len(indices) > 0:
    lower_frequency = freq_shifted[indices[0]]
    upper_frequency = freq_shifted[indices[-1]]

    bandwidth = abs(upper_frequency - lower_frequency)

else:
    lower_frequency = 0
    upper_frequency = 0
    bandwidth = 0

print("Estimated Bandwidth:", round(bandwidth, 2), "Hz")

# =========================
# PLOT SPECTRUM
# =========================

plt.figure(figsize=(12, 5))

plt.plot(freq_shifted, magnitude_db)

plt.title("FFT Frequency Spectrum")
plt.xlabel("Frequency (Hz)")
plt.ylabel("Magnitude (dB)")
plt.grid()

plt.tight_layout()
plt.show()

# =========================
# SAVE RESULTS
# =========================

os.makedirs("output", exist_ok=True)

np.save("output/fft_frequencies.npy", freq_shifted)
np.save("output/fft_magnitude.npy", magnitude_db)

with open("output/fft_report.txt", "w") as f:

    f.write("===== FFT ANALYSIS REPORT =====\n")
    f.write(f"Total Samples: {N}\n")
    f.write(f"Sample Rate: {sample_rate} Hz\n")
    f.write(
        f"Dominant Frequency: "
        f"{abs(dominant_frequency):.2f} Hz\n"
    )
    f.write(
        f"Estimated Bandwidth: "
        f"{bandwidth:.2f} Hz\n"
    )

print("\n--------------------------------")
print("FFT Analysis Complete")
print("Files saved:")
print("output/fft_frequencies.npy")
print("output/fft_magnitude.npy")
print("output/fft_report.txt")
print("--------------------------------")
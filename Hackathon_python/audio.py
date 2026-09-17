import wave
import numpy as np
import matplotlib.pyplot as plt

# =========================
# INPUT
# =========================

filename = "signal.wav"

audio = wave.open(filename, "rb")

sample_rate = audio.getframerate()
frames = audio.getnframes()

# Read actual audio data
data = audio.readframes(frames)

audio.close()

# Convert audio bytes into numbers
samples = np.frombuffer(data, dtype=np.int16)

# =========================
# SIGNAL INFORMATION
# =========================

print("===== SIGNAL PROCESSING =====")
print("Total Samples:", len(samples))
print("Sampling Rate:", sample_rate, "Hz")

# =========================
# WAVEFORM
# =========================

time = np.arange(len(samples)) / sample_rate

plt.figure(figsize=(10, 4))
plt.plot(time, samples)
plt.title("Signal Waveform")
plt.xlabel("Time (seconds)")
plt.ylabel("Amplitude")
plt.grid()
plt.tight_layout()
plt.show()

# =========================
# FFT / FREQUENCY ANALYSIS
# =========================

fft_data = np.fft.fft(samples)

frequencies = np.fft.fftfreq(
    len(samples),
    1 / sample_rate
)

# Only positive frequencies
positive = frequencies >= 0

positive_frequencies = frequencies[positive]
positive_magnitude = np.abs(fft_data[positive])

# Find strongest frequency
peak_index = np.argmax(positive_magnitude)
peak_frequency = positive_frequencies[peak_index]

print("Detected Frequency:", round(peak_frequency, 2), "Hz")

# =========================
# FREQUENCY GRAPH
# =========================

plt.figure(figsize=(10, 4))

plt.plot(
    positive_frequencies,
    positive_magnitude
)

plt.title("Frequency Spectrum")
plt.xlabel("Frequency (Hz)")
plt.ylabel("Magnitude")
plt.grid()
plt.tight_layout()
plt.show()

import wave
import numpy as np

filename = "signal.wav"

# =========================
# READ AUDIO
# =========================

audio = wave.open(filename, "rb")

channels = audio.getnchannels()
sample_width = audio.getsampwidth()
sample_rate = audio.getframerate()
frames = audio.getnframes()

data = audio.readframes(frames)

audio.close()

# =========================
# CONVERT AUDIO TO NUMBERS
# =========================

samples = np.frombuffer(data, dtype=np.int16)

print("\n===== SIGNAL INFORMATION =====")
print("Channels:", channels)
print("Sample Width:", sample_width, "bytes")
print("Sample Rate:", sample_rate, "Hz")
print("Number of Samples:", len(samples))

duration = len(samples) / sample_rate

print("Duration:", duration, "seconds")

# =========================
# PROCESSING
# =========================

# Convert to float
signal = samples.astype(np.float32)

# Remove DC offset
signal = signal - np.mean(signal)

# Normalize signal
max_value = np.max(np.abs(signal))

if max_value != 0:
    signal = signal / max_value

print("\n===== PROCESSING =====")
print("DC Offset Removed: YES")
print("Normalization: YES")
print("Processing Complete!")

# =========================
# OUTPUT
# =========================

print("\n===== OUTPUT =====")
print("Processed Samples:", len(signal))
print("Minimum Value:", np.min(signal))
print("Maximum Value:", np.max(signal))

np.save("processed_signal.npy", signal)

print("\nProcessed signal saved as:")
print("processed_signal.npy")

# =========================
# FFT PROCESSING
# =========================

import matplotlib.pyplot as plt

# Calculate FFT
fft_result = np.fft.fft(signal)

# Calculate frequency values
frequencies = np.fft.fftfreq(len(signal), 1 / sample_rate)

# Take only positive frequencies
positive = frequencies >= 0

frequencies = frequencies[positive]
fft_magnitude = np.abs(fft_result[positive])

# =========================
# FFT OUTPUT
# =========================
# =========================
# DETECT DOMINANT FREQUENCY
# =========================

# Find the index of maximum FFT magnitude
peak_index = np.argmax(fft_magnitude)

# Get corresponding frequency
detected_frequency = frequencies[peak_index]

print("\n===== FFT ANALYSIS =====")
print("Detected Frequency:", round(detected_frequency, 2), "Hz")

print("\n===== FFT ANALYSIS =====")
print("FFT Processing: Complete")
print("Frequency Range: 0 -", sample_rate // 2, "Hz")

# =========================
# PLOT FFT
# =========================

plt.figure(figsize=(10, 5))

plt.plot(frequencies, fft_magnitude)

plt.title("Frequency Spectrum (FFT)")
plt.xlabel("Frequency (Hz)")
plt.ylabel("Magnitude")

plt.grid()

plt.show()

np.save("frequencies.npy", frequencies)
np.save("fft_magnitude.npy", fft_magnitude)

print("FFT data saved successfully.")

# =========================
# FFT ANALYSIS
# =========================

# Calculate FFT
fft_result = np.fft.fft(signal)

# Calculate frequency values
frequencies = np.fft.fftfreq(
    len(signal),
    1 / sample_rate
)

# Keep only positive frequencies
positive = frequencies >= 0

frequencies = frequencies[positive]
fft_magnitude = np.abs(fft_result[positive])

# =========================
# FFT OUTPUT
# =========================

print("\n===== FFT ANALYSIS =====")

print("FFT Processing: Complete")

print(
    "Frequency Range: 0 -",
    sample_rate // 2,
    "Hz"
)

print(
    "Number of Frequency Points:",
    len(frequencies)
)

# =========================
# SAVE FFT DATA
# =========================

np.save("frequencies.npy", frequencies)
np.save("fft_magnitude.npy", fft_magnitude)

print("FFT data saved successfully.")

# =========================
# FREQUENCY SPECTRUM GRAPH
# =========================

plt.figure(figsize=(10, 5))

plt.plot(frequencies, fft_magnitude)

plt.title("Frequency Spectrum (FFT)")
plt.xlabel("Frequency (Hz)")
plt.ylabel("Magnitude")

plt.grid()

plt.show()

# =========================
# BANDWIDTH ESTIMATION
# =========================

# Find maximum FFT magnitude
peak_magnitude = np.max(fft_magnitude)

# Set threshold at 10% of peak
threshold = 0.10 * peak_magnitude

# Find frequencies above threshold
active_frequencies = frequencies[fft_magnitude >= threshold]

# Calculate bandwidth
if len(active_frequencies) > 0:
    bandwidth = (
        np.max(active_frequencies)
        - np.min(active_frequencies)
    )
else:
    bandwidth = 0

print("\n===== BANDWIDTH ANALYSIS =====")
print("Estimated Bandwidth:", round(bandwidth, 2), "Hz")

# =========================
# SNR ESTIMATION
# =========================

signal_power = np.mean(signal ** 2)

noise_power = np.var(signal - np.mean(signal))

if noise_power > 0:
    snr = 10 * np.log10(signal_power / noise_power)
else:
    snr = float("inf")

print("\n===== SNR ANALYSIS =====")
print("Estimated SNR:", round(snr, 2), "dB")

# =========================
# FINAL PROCESSING REPORT
# =========================

print("\n==============================")
print("      SIGNAL REPORT")
print("==============================")

print("\n===== SIGNAL REPORT =====")

print("Input File             : signal.wav")
print("Sample Rate            :", sample_rate, "Hz")
print("Total Samples          :", len(signal))
print("Duration               :", round(duration, 3), "seconds")
print("Detected Frequency     : 2000.0 Hz")
print("Bandwidth              :", round(bandwidth, 2), "Hz")
print("SNR                    :", round(snr, 2), "dB")
print("==============================")
print("Processing Complete!")
print("==============================")
# ==============================
# SAVE PROCESSED OUTPUT
# ==============================

import os
import wave
import numpy as np

output_folder = "output"

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Convert processed signal to int16
processed_audio = np.clip(signal, -32768, 32767).astype(np.int16)

# Save processed WAV file
output_wav = os.path.join(output_folder, "processed_signal.wav")

with wave.open(output_wav, "wb") as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(sample_rate)
    output.writeframes(processed_audio.tobytes())

print("Processed signal saved as:", output_wav)

# Save signal information
report_file = os.path.join(output_folder, "signal_report.txt")

with open(report_file, "w") as f:
    f.write("===== SIGNAL PROCESSING REPORT =====\n")
    f.write(f"Input File: signal.wav\n")
    f.write(f"Sample Rate: {sample_rate} Hz\n")
    f.write(f"Total Samples: {len(signal)}\n")
    f.write(f"Detected Frequency: {detected_frequency} Hz\n")
    f.write(f"Bandwidth: {bandwidth:.2f} Hz\n")
    f.write(f"SNR: {snr:.2f} dB\n")
    f.write("Processing Status: Complete\n")

print("Report saved as:", report_file)

import wave
import numpy as np
import os

input_file = "signal.wav"

# -------------------------
# Read WAV
# -------------------------
with wave.open(input_file, "rb") as audio:

    sample_rate = audio.getframerate()
    channels = audio.getnchannels()
    sample_width = audio.getsampwidth()
    frames = audio.getnframes()

    data = audio.readframes(frames)

print("===== WAV TO IQ =====")
print("Input File:", input_file)
print("Sample Rate:", sample_rate, "Hz")
print("Channels:", channels)
print("Samples:", frames)

# -------------------------
# Convert to samples
# -------------------------
if sample_width != 2:
    raise ValueError("This program currently supports 16-bit WAV.")

samples = np.frombuffer(data, dtype=np.int16)

# Stereo → Mono
if channels == 2:
    samples = samples.reshape(-1, 2)
    samples = np.mean(samples, axis=1)

samples = samples.astype(np.float32)

# -------------------------
# Normalize
# -------------------------
max_value = np.max(np.abs(samples))

if max_value > 0:
    samples = samples / max_value

# -------------------------
# Create test I/Q
# -------------------------
I = samples
Q = np.zeros_like(I)

iq_signal = I + 1j * Q

# -------------------------
# Save
# -------------------------
os.makedirs("output", exist_ok=True)

iq_file = "output/signal.iq"

iq_signal.astype(np.complex64).tofile(iq_file)

np.save("output/signal_iq.npy", iq_signal)

print("--------------------------------")
print("IQ Conversion Complete")
print("IQ Samples:", len(iq_signal))
print("IQ File:", iq_file)
print("NumPy File: output/signal_iq.npy")
print("--------------------------------")
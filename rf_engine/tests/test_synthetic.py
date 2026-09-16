import numpy as np
from scipy.io.wavfile import write

sr = 48000
duration = 2.0
t = np.linspace(0, duration, int(sr*duration), endpoint=False)

# 4.8 kHz carrier
carrier = np.sin(2*np.pi*4800*t)

# Low noise (20 dB SNR approx)
noise = np.random.normal(0, 0.08, len(t))

signal = carrier + noise

signal = signal / np.max(np.abs(signal))
signal = (signal * 32767).astype(np.int16)

write("sample_test.wav", sr, signal)

print("Clean synthetic RF signal generated.")
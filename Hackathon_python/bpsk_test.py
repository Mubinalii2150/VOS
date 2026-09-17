import numpy as np
import os

# =========================
# PARAMETERS
# =========================

sample_rate = 10000
symbol_rate = 1000
num_symbols = 1000

samples_per_symbol = sample_rate // symbol_rate

# =========================
# GENERATE RANDOM BITS
# =========================

bits = np.random.randint(0, 2, num_symbols)

# BPSK:
# 0 -> -1
# 1 -> +1

symbols = 2 * bits - 1

# Repeat each symbol
signal = np.repeat(symbols, samples_per_symbol)

# =========================
# CREATE COMPLEX IQ
# =========================

iq_signal = signal.astype(np.complex64)

# =========================
# NORMALIZE
# =========================

iq_signal = iq_signal / np.max(np.abs(iq_signal))

# =========================
# SAVE
# =========================

os.makedirs("output", exist_ok=True)

np.save("output/bpsk_test.npy", iq_signal)

iq_signal.tofile("output/bpsk_test.iq")

# Save original bits for verification
np.save("output/bpsk_original_bits.npy", bits)

print("===== BPSK TEST SIGNAL =====")
print("Sample Rate:", sample_rate)
print("Symbol Rate:", symbol_rate)
print("Number of Symbols:", num_symbols)
print("Total IQ Samples:", len(iq_signal))

print("\nFiles created:")
print("output/bpsk_test.npy")
print("output/bpsk_test.iq")
print("output/bpsk_original_bits.npy")
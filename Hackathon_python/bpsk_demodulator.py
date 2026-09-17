import numpy as np
import os

# =========================
# LOAD BPSK SIGNAL
# =========================

signal_file = "output/bpsk_test.npy"
bits_file = "output/bpsk_original_bits.npy"

if not os.path.exists(signal_file):
    raise FileNotFoundError("BPSK signal not found.")

iq_signal = np.load(signal_file)

original_bits = np.load(bits_file)

print("===== BPSK DEMODULATION =====")
print("IQ Samples:", len(iq_signal))
print("Original Bits:", len(original_bits))


# =========================
# PARAMETERS
# =========================

sample_rate = 10000
symbol_rate = 1000

samples_per_symbol = sample_rate // symbol_rate

print("Samples per Symbol:", samples_per_symbol)


# =========================
# SYMBOL SAMPLING
# =========================

# Take the middle sample of every symbol
start = samples_per_symbol // 2

symbol_samples = iq_signal[start::samples_per_symbol]

# Make sure both arrays have same length
symbol_samples = symbol_samples[:len(original_bits)]


# =========================
# BPSK DECISION
# =========================

# Positive → 1
# Negative → 0

recovered_bits = (np.real(symbol_samples) > 0).astype(int)


# =========================
# COMPARE BITS
# =========================

comparison_length = min(
    len(original_bits),
    len(recovered_bits)
)

original_bits = original_bits[:comparison_length]
recovered_bits = recovered_bits[:comparison_length]

correct_bits = np.sum(
    original_bits == recovered_bits
)

accuracy = (correct_bits / comparison_length) * 100


# =========================
# DISPLAY RESULT
# =========================

print("\n===== DEMODULATION RESULT =====")
print("Recovered Bits:", len(recovered_bits))
print("Correct Bits:", correct_bits)
print("Bit Accuracy:", round(accuracy, 2), "%")

print("\nFirst 20 Original Bits:")
print(original_bits[:20])

print("\nFirst 20 Recovered Bits:")
print(recovered_bits[:20])


# =========================
# SAVE RECOVERED BITS
# =========================

os.makedirs("output", exist_ok=True)

np.save(
    "output/bpsk_recovered_bits.npy",
    recovered_bits
)

with open("output/bpsk_recovered_bits.txt", "w") as f:
    f.write("".join(map(str, recovered_bits)))

print("\nFiles saved:")
print("output/bpsk_recovered_bits.npy")
print("output/bpsk_recovered_bits.txt")
import numpy as np
import os

# =========================
# INPUT FILES
# =========================

signal_file = "output/message_bpsk_signal.npy"
original_bits_file = "output/message_original_bits.npy"

if not os.path.exists(signal_file):
    raise FileNotFoundError("BPSK signal file not found.")

if not os.path.exists(original_bits_file):
    raise FileNotFoundError("Original bits file not found.")

# =========================
# LOAD SIGNAL
# =========================

iq_signal = np.load(signal_file)
original_bits = np.load(original_bits_file)

print("===== BPSK DEMODULATION =====")
print("IQ Samples:", len(iq_signal))
print("Original Bits:", len(original_bits))

# =========================
# SIGNAL PARAMETERS
# =========================

samples_per_symbol = 10

print("Samples per Symbol:", samples_per_symbol)

# =========================
# SAMPLE EACH SYMBOL
# =========================

start = samples_per_symbol // 2

symbol_samples = iq_signal[start::samples_per_symbol]

# Keep only required symbols
symbol_samples = symbol_samples[:len(original_bits)]

# =========================
# BPSK DEMODULATION
# =========================

# Positive → 1
# Negative → 0

recovered_bits = (np.real(symbol_samples) > 0).astype(int)

# =========================
# CHECK ACCURACY
# =========================

length = min(len(original_bits), len(recovered_bits))

original_bits = original_bits[:length]
recovered_bits = recovered_bits[:length]

correct_bits = np.sum(original_bits == recovered_bits)

accuracy = (correct_bits / length) * 100

print("\n===== DEMODULATION RESULT =====")
print("Recovered Bits:", len(recovered_bits))
print("Correct Bits:", correct_bits)
print("Bit Accuracy:", round(accuracy, 2), "%")

print("\nFirst 40 Original Bits:")
print(original_bits[:40])

print("\nFirst 40 Recovered Bits:")
print(recovered_bits[:40])

# =========================
# SAVE RECOVERED BITS
# =========================

os.makedirs("output", exist_ok=True)

np.save(
    "output/message_recovered_bits.npy",
    recovered_bits
)

with open(
    "output/message_recovered_bits.txt",
    "w"
) as f:
    f.write("".join(map(str, recovered_bits)))

print("\nFiles saved:")
print("output/message_recovered_bits.npy")
print("output/message_recovered_bits.txt")
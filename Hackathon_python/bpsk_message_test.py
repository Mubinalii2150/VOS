import numpy as np
import os

# =========================
# INPUT MESSAGE
# =========================

message = "HELLO BPSK"

print("===== BPSK MESSAGE TEST =====")
print("Original Message:", message)

# =========================
# TEXT → BITS
# =========================

message_bytes = message.encode("utf-8")

bits = []

for byte in message_bytes:
    binary = format(byte, "08b")
    bits.extend([int(bit) for bit in binary])

bits = np.array(bits)

print("Total Bits:", len(bits))
print("First 40 Bits:", bits[:40])

# =========================
# BPSK MODULATION
# =========================

# Bit 0 → -1
# Bit 1 → +1

symbols = 2 * bits - 1

# One symbol = 10 samples
samples_per_symbol = 10

signal = np.repeat(symbols, samples_per_symbol)

# Convert to complex IQ
iq_signal = signal.astype(np.complex64)

# Normalize
iq_signal = iq_signal / np.max(np.abs(iq_signal))

# =========================
# SAVE FILES
# =========================

os.makedirs("output", exist_ok=True)

np.save("output/message_bpsk_signal.npy", iq_signal)

iq_signal.tofile("output/message_bpsk_signal.iq")

np.save("output/message_original_bits.npy", bits)

with open("output/original_message.txt", "w", encoding="utf-8") as f:
    f.write(message)

print("\n===== SIGNAL CREATED =====")
print("Samples per Symbol:", samples_per_symbol)
print("Total IQ Samples:", len(iq_signal))

print("\nFiles created:")
print("output/message_bpsk_signal.npy")
print("output/message_bpsk_signal.iq")
print("output/message_original_bits.npy")
print("output/original_message.txt")
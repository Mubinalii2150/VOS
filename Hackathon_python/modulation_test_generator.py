import numpy as np
import os

# =========================
# SETTINGS
# =========================

sample_rate = 10000
symbol_rate = 1000
samples_per_symbol = sample_rate // symbol_rate

message = "HELLO"

os.makedirs("output", exist_ok=True)


# =========================
# TEXT → BITS
# =========================

def text_to_bits(text):
    bits = []

    for byte in text.encode("utf-8"):
        binary = format(byte, "08b")
        bits.extend(int(bit) for bit in binary)

    return np.array(bits)


bits = text_to_bits(message)

print("===== MODULATION TEST GENERATOR =====")
print("Message:", message)
print("Total Bits:", len(bits))
print("Samples/Symbol:", samples_per_symbol)


# =========================
# BPSK
# =========================

bpsk_symbols = 2 * bits - 1

bpsk_signal = np.repeat(
    bpsk_symbols,
    samples_per_symbol
)

bpsk_iq = bpsk_signal.astype(np.complex64)

np.save("output/test_bpsk.npy", bpsk_iq)


# =========================
# QPSK
# =========================

# Make even number of bits
if len(bits) % 2 != 0:
    bits = np.append(bits, 0)

bit_pairs = bits.reshape(-1, 2)

qpsk_symbols = []

for b1, b2 in bit_pairs:

    if b1 == 0 and b2 == 0:
        symbol = 1 + 1j

    elif b1 == 0 and b2 == 1:
        symbol = -1 + 1j

    elif b1 == 1 and b2 == 1:
        symbol = -1 - 1j

    else:
        symbol = 1 - 1j

    qpsk_symbols.append(symbol)

qpsk_symbols = np.array(
    qpsk_symbols,
    dtype=np.complex64
)

qpsk_signal = np.repeat(
    qpsk_symbols,
    samples_per_symbol
)

qpsk_signal = qpsk_signal / np.max(
    np.abs(qpsk_signal)
)

np.save("output/test_qpsk.npy", qpsk_signal)


# =========================
# FSK
# =========================

fsk_signal = []

f1 = 1000
f2 = 2000

for bit in bits:

    frequency = f1 if bit == 0 else f2

    t = np.arange(samples_per_symbol) / sample_rate

    symbol = np.exp(
        2j * np.pi * frequency * t
    )

    fsk_signal.extend(symbol)

fsk_signal = np.array(
    fsk_signal,
    dtype=np.complex64
)

np.save("output/test_fsk.npy", fsk_signal)


# =========================
# OUTPUT
# =========================

print("\n===== FILES CREATED =====")

print("BPSK : output/test_bpsk.npy")
print("QPSK : output/test_qpsk.npy")
print("FSK  : output/test_fsk.npy")

print("\nGeneration Complete!")
import numpy as np
import os

filename = "output/test_qpsk.npy"

if not os.path.exists(filename):
    raise FileNotFoundError("test_qpsk.npy not found.")

signal = np.load(filename)

sample_rate = 10000
symbol_rate = 1000
samples_per_symbol = sample_rate // symbol_rate

print("===== QPSK DEMODULATION =====")
print("Total Samples:", len(signal))
print("Samples per Symbol:", samples_per_symbol)

recovered_bits = []

for i in range(0, len(signal), samples_per_symbol):

    segment = signal[i:i + samples_per_symbol]

    if len(segment) < samples_per_symbol:
        break

    # Take middle sample of the symbol
    sample = segment[len(segment) // 2]

    I = np.real(sample)
    Q = np.imag(sample)

    # QPSK decision
    if I >= 0 and Q >= 0:
        bits = [0, 0]

    elif I < 0 and Q >= 0:
        bits = [0, 1]

    elif I < 0 and Q < 0:
        bits = [1, 1]

    else:
        bits = [1, 0]

    recovered_bits.extend(bits)

recovered_bits = np.array(recovered_bits)

print("\n===== RESULT =====")
print("Recovered Bits:", len(recovered_bits))

print("\nFirst 40 Recovered Bits:")
print(recovered_bits[:40])

os.makedirs("output", exist_ok=True)

np.save(
    "output/qpsk_recovered_bits.npy",
    recovered_bits
)

with open(
    "output/qpsk_recovered_bits.txt",
    "w"
) as f:
    f.write("".join(map(str, recovered_bits)))

print("\nFiles saved:")
print("output/qpsk_recovered_bits.npy")
print("output/qpsk_recovered_bits.txt")

print("\n--------------------------------")
print("QPSK Demodulation Complete")
print("--------------------------------")
import numpy as np
import os

filename = "output/test_fsk.npy"

if not os.path.exists(filename):
    raise FileNotFoundError("test_fsk.npy not found.")

signal = np.load(filename)

sample_rate = 10000
symbol_rate = 1000
samples_per_symbol = sample_rate // symbol_rate

f1 = 1000
f2 = 2000

print("===== FSK DEMODULATION =====")
print("Total Samples:", len(signal))
print("Samples per Symbol:", samples_per_symbol)
print("Frequency 1:", f1, "Hz")
print("Frequency 2:", f2, "Hz")

recovered_bits = []

for i in range(0, len(signal), samples_per_symbol):

    segment = signal[i:i + samples_per_symbol]

    if len(segment) < samples_per_symbol:
        break

    t = np.arange(samples_per_symbol) / sample_rate

    ref1 = np.exp(2j * np.pi * f1 * t)
    ref2 = np.exp(2j * np.pi * f2 * t)

    energy1 = abs(np.vdot(segment, ref1)) ** 2
    energy2 = abs(np.vdot(segment, ref2)) ** 2

    if energy1 > energy2:
        bit = 0
    else:
        bit = 1

    recovered_bits.append(bit)

recovered_bits = np.array(recovered_bits)

print("\n===== RESULT =====")
print("Recovered Bits:", len(recovered_bits))

print("\nFirst 40 Recovered Bits:")
print(recovered_bits[:40])

os.makedirs("output", exist_ok=True)

np.save(
    "output/fsk_recovered_bits.npy",
    recovered_bits
)

with open(
    "output/fsk_recovered_bits.txt",
    "w"
) as f:
    f.write("".join(map(str, recovered_bits)))

print("\nFiles saved:")
print("output/fsk_recovered_bits.npy")
print("output/fsk_recovered_bits.txt")

print("\n--------------------------------")
print("FSK Demodulation Complete")
print("--------------------------------")
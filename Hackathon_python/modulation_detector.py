import numpy as np
import os


# =========================
# LOAD IQ SIGNAL
# =========================

filename = "output/processed_iq.npy"

if not os.path.exists(filename):
    raise FileNotFoundError("processed_iq.npy not found.")

iq_signal = np.load(filename)

print("===== MODULATION ANALYSIS =====")
print("IQ Samples:", len(iq_signal))


# =========================
# I AND Q
# =========================

I = np.real(iq_signal)
Q = np.imag(iq_signal)

# =========================
# AMPLITUDE AND PHASE
# =========================

amplitude = np.abs(iq_signal)
phase = np.unwrap(np.angle(iq_signal))

# =========================
# BASIC FEATURES
# =========================

mean_amplitude = np.mean(amplitude)
std_amplitude = np.std(amplitude)

mean_I = np.mean(I)
mean_Q = np.mean(Q)

std_I = np.std(I)
std_Q = np.std(Q)

print("\n===== FEATURES =====")
print("Mean Amplitude :", round(mean_amplitude, 4))
print("Amplitude STD  :", round(std_amplitude, 4))
print("Mean I         :", round(mean_I, 4))
print("Mean Q         :", round(mean_Q, 4))
print("I STD          :", round(std_I, 4))
print("Q STD          :", round(std_Q, 4))


# =========================
# CHECK IQ BALANCE
# =========================

if std_Q < 0.01 and std_I > 0.01:

    print("\nObservation:")
    print("Q component is almost zero.")
    print("This is expected because the current IQ file")
    print("was generated from a single WAV waveform.")

    modulation = "Unknown / WAV-derived test signal"

else:

    # Basic candidate analysis
    if std_I > 0 and std_Q > 0:

        amplitude_variation = std_amplitude / (
            mean_amplitude + 1e-12
        )

        if amplitude_variation < 0.15:
            modulation = "Constant-envelope candidate"

        else:
            modulation = "Amplitude-varying candidate"

    else:
        modulation = "Unknown"


# =========================
# RESULT
# =========================

print("\n===== MODULATION RESULT =====")
print("Detected/Candidate Type:", modulation)

# =========================
# SAVE RESULT
# =========================

os.makedirs("output", exist_ok=True)

with open("output/modulation_result.txt", "w") as f:

    f.write("===== MODULATION ANALYSIS =====\n")
    f.write(f"IQ Samples: {len(iq_signal)}\n")
    f.write(f"Mean Amplitude: {mean_amplitude:.4f}\n")
    f.write(f"Amplitude STD: {std_amplitude:.4f}\n")
    f.write(f"Mean I: {mean_I:.4f}\n")
    f.write(f"Mean Q: {mean_Q:.4f}\n")
    f.write(f"I STD: {std_I:.4f}\n")
    f.write(f"Q STD: {std_Q:.4f}\n")
    f.write(f"Candidate Type: {modulation}\n")

print("\nResult saved as: output/modulation_result.txt")
import numpy as np
import matplotlib.pyplot as plt
import os

# =========================
# LOAD PROCESSED IQ
# =========================

filename = "output/processed_iq.npy"

if not os.path.exists(filename):
    raise FileNotFoundError("processed_iq.npy not found.")

iq_signal = np.load(filename)

print("===== IQ ANALYSIS =====")
print("IQ Samples:", len(iq_signal))

# =========================
# I AND Q COMPONENTS
# =========================

I = np.real(iq_signal)
Q = np.imag(iq_signal)

# =========================
# AMPLITUDE
# =========================

amplitude = np.abs(iq_signal)

# =========================
# PHASE
# =========================

phase = np.angle(iq_signal)

print("Average Amplitude:", round(np.mean(amplitude), 4))
print("Maximum Amplitude:", round(np.max(amplitude), 4))
print("Minimum Amplitude:", round(np.min(amplitude), 4))

# =========================
# PLOT I COMPONENT
# =========================

plt.figure(figsize=(10, 4))
plt.plot(I[:5000])
plt.title("I Component")
plt.xlabel("Sample")
plt.ylabel("Amplitude")
plt.grid()
plt.show()

# =========================
# PLOT Q COMPONENT
# =========================

plt.figure(figsize=(10, 4))
plt.plot(Q[:5000])
plt.title("Q Component")
plt.xlabel("Sample")
plt.ylabel("Amplitude")
plt.grid()
plt.show()

# =========================
# PLOT AMPLITUDE
# =========================

plt.figure(figsize=(10, 4))
plt.plot(amplitude[:5000])
plt.title("IQ Signal Amplitude")
plt.xlabel("Sample")
plt.ylabel("Amplitude")
plt.grid()
plt.show()

# =========================
# CONSTELLATION
# =========================

plt.figure(figsize=(6, 6))

plt.scatter(
    I[::20],
    Q[::20],
    s=5
)

plt.title("IQ Constellation")
plt.xlabel("I")
plt.ylabel("Q")
plt.grid()
plt.axis("equal")
plt.show()

# =========================
# SAVE ANALYSIS DATA
# =========================

np.save("output/I_component.npy", I)
np.save("output/Q_component.npy", Q)
np.save("output/amplitude.npy", amplitude)
np.save("output/phase.npy", phase)

print("--------------------------------")
print("IQ Analysis Complete")
print("Analysis files saved in output/")
print("--------------------------------")
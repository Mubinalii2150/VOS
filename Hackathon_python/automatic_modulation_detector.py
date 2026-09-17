import numpy as np
import os


def detect_modulation(filename):

    if not os.path.exists(filename):
        print("File not found:", filename)
        return "Unknown"

    signal = np.load(filename)

    I = np.real(signal)
    Q = np.imag(signal)

    amplitude = np.abs(signal)

    # Phase
    phase = np.unwrap(np.angle(signal))

    # Instantaneous frequency
    phase_diff = np.diff(phase)

    # Remove extreme values
    phase_diff = phase_diff[
        np.abs(phase_diff) < 1.0
    ]

    print("\n==============================")
    print("File:", filename)
    print("==============================")

    print("I STD:", round(np.std(I), 4))
    print("Q STD:", round(np.std(Q), 4))
    print("Amplitude STD:", round(np.std(amplitude), 4))
    print(
        "Frequency STD:",
        round(np.std(phase_diff), 4)
    )

    # =========================
    # FEATURE VALUES
    # =========================

    i_std = np.std(I)
    q_std = np.std(Q)
    amp_std = np.std(amplitude)
    freq_std = np.std(phase_diff)

    # =========================
    # DETECTION
    # =========================

    # BPSK
    if q_std < 0.01 and i_std > 0.1:

        modulation = "BPSK"

    # FSK
    elif (
        amp_std < 0.05
        and freq_std > 0.05
    ):

        modulation = "FSK"

    # QPSK
    elif (
        q_std > 0.1
        and i_std > 0.1
        and amp_std < 0.05
    ):

        modulation = "QPSK"

    else:

        modulation = "Unknown"

    print("\nDetected Modulation:", modulation)

    return modulation


# =========================
# TEST SIGNALS
# =========================

print(
    "===== AUTOMATIC MODULATION "
    "CLASSIFICATION ====="
)

detect_modulation(
    "output/test_bpsk.npy"
)

detect_modulation(
    "output/test_qpsk.npy"
)

detect_modulation(
    "output/test_fsk.npy"
)

print(
    "\n=============================================="
)

print(
    "Automatic Modulation Detection Complete"
)

print(
    "=============================================="
)
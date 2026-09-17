import os
import numpy as np


# ==========================================
# LOAD SIGNAL
# ==========================================

def load_signal(filename):

    if not os.path.exists(filename):
        raise FileNotFoundError(
            f"Signal file not found: {filename}"
        )

    signal = np.load(filename)

    if len(signal) == 0:
        raise ValueError("Signal file is empty.")

    return signal


# ==========================================
# SIGNAL ANALYSIS
# ==========================================

def analyze_signal(signal):

    I = np.real(signal)
    Q = np.imag(signal)
    amplitude = np.abs(signal)

    return {
        "samples": len(signal),
        "mean_amplitude": np.mean(amplitude),
        "amplitude_std": np.std(amplitude),
        "I_std": np.std(I),
        "Q_std": np.std(Q)
    }


# ==========================================
# MODULATION DETECTION
# ==========================================

def detect_modulation(signal):

    I = np.real(signal)
    Q = np.imag(signal)
    amplitude = np.abs(signal)

    I_std = np.std(I)
    Q_std = np.std(Q)
    amplitude_std = np.std(amplitude)

    # BPSK
    if Q_std < 0.01 and I_std > 0.1:
        return "BPSK"

    # QPSK
    if Q_std > 0.1 and amplitude_std < 0.2:
        return "QPSK"

    # FSK
    # Current test FSK has constant amplitude
    # and both I and Q components vary.
    if amplitude_std < 0.2 and I_std > 0.1 and Q_std > 0.1:
        return "FSK"

    return "Unknown"


# ==========================================
# BPSK DEMODULATION
# ==========================================

def bpsk_demodulate(signal):

    samples_per_symbol = 10
    recovered_bits = []

    for i in range(
        0,
        len(signal),
        samples_per_symbol
    ):

        segment = signal[
            i:i + samples_per_symbol
        ]

        if len(segment) < samples_per_symbol:
            break

        sample = segment[
            samples_per_symbol // 2
        ]

        if np.real(sample) > 0:
            recovered_bits.append(1)
        else:
            recovered_bits.append(0)

    return np.array(recovered_bits)


# ==========================================
# QPSK DEMODULATION
# ==========================================

def qpsk_demodulate(signal):

    samples_per_symbol = 10
    recovered_bits = []

    for i in range(
        0,
        len(signal),
        samples_per_symbol
    ):

        segment = signal[
            i:i + samples_per_symbol
        ]

        if len(segment) < samples_per_symbol:
            break

        sample = segment[
            samples_per_symbol // 2
        ]

        I = np.real(sample)
        Q = np.imag(sample)

        if I >= 0 and Q >= 0:
            bits = [0, 0]

        elif I < 0 and Q >= 0:
            bits = [0, 1]

        elif I < 0 and Q < 0:
            bits = [1, 1]

        else:
            bits = [1, 0]

        recovered_bits.extend(bits)

    return np.array(recovered_bits)


# ==========================================
# FSK DEMODULATION
# ==========================================

def fsk_demodulate(signal):

    sample_rate = 10000
    samples_per_symbol = 10

    f1 = 1000
    f2 = 2000

    recovered_bits = []

    for i in range(
        0,
        len(signal),
        samples_per_symbol
    ):

        segment = signal[
            i:i + samples_per_symbol
        ]

        if len(segment) < samples_per_symbol:
            break

        t = np.arange(
            samples_per_symbol
        ) / sample_rate

        ref1 = np.exp(
            2j * np.pi * f1 * t
        )

        ref2 = np.exp(
            2j * np.pi * f2 * t
        )

        energy1 = abs(
            np.vdot(segment, ref1)
        ) ** 2

        energy2 = abs(
            np.vdot(segment, ref2)
        ) ** 2

        if energy1 > energy2:
            recovered_bits.append(0)
        else:
            recovered_bits.append(1)

    return np.array(recovered_bits)


# ==========================================
# BITS → MESSAGE
# ==========================================

def bits_to_message(bits):

    message = ""

    for i in range(
        0,
        len(bits),
        8
    ):

        byte = bits[i:i + 8]

        if len(byte) == 8:

            binary = "".join(
                map(str, byte)
            )

            decimal_value = int(
                binary,
                2
            )

            message += chr(
                decimal_value
            )

    return message


# ==========================================
# MAIN PIPELINE
# ==========================================

def main():

    print()
    print("=" * 55)
    print("       AUTOMATIC SIGNAL ANALYSIS SYSTEM")
    print("=" * 55)

    # Change this file to test:
    # test_bpsk.npy
    # test_qpsk.npy
    # test_fsk.npy

    filename = "output/test_bpsk.npy"

    # --------------------------------------

    print("\n[1] Loading Signal...")

    signal = load_signal(filename)

    print("    Input:", filename)
    print("    Samples:", len(signal))

    # --------------------------------------

    print("\n[2] Signal Analysis...")

    features = analyze_signal(signal)

    print(
        "    Mean Amplitude:",
        round(
            features["mean_amplitude"],
            4
        )
    )

    print(
        "    Amplitude STD:",
        round(
            features["amplitude_std"],
            4
        )
    )

    print(
        "    I STD:",
        round(
            features["I_std"],
            4
        )
    )

    print(
        "    Q STD:",
        round(
            features["Q_std"],
            4
        )
    )

    # --------------------------------------

    print("\n[3] Modulation Detection...")

    modulation = detect_modulation(signal)

    print(
        "    Detected Modulation:",
        modulation
    )

    # --------------------------------------

    print("\n[4] Demodulation...")

    if modulation == "BPSK":

        recovered_bits = bpsk_demodulate(
            signal
        )

    elif modulation == "QPSK":

        recovered_bits = qpsk_demodulate(
            signal
        )

    elif modulation == "FSK":

        recovered_bits = fsk_demodulate(
            signal
        )

    else:

        recovered_bits = np.array([])

    # --------------------------------------

    if len(recovered_bits) > 0:

        message = bits_to_message(
            recovered_bits
        )

        print(
            "    Recovered Bits:",
            len(recovered_bits)
        )

        print(
            "    Recovered Message:",
            message
        )

        np.save(
            "output/automatic_recovered_bits.npy",
            recovered_bits
        )

    else:

        message = ""

        print(
            "    Message recovery unavailable."
        )

    # --------------------------------------

    print("\n[5] Saving Report...")

    os.makedirs(
        "output",
        exist_ok=True
    )

    with open(
        "output/final_analysis_report.txt",
        "w",
        encoding="utf-8"
    ) as f:

        f.write(
            "===== SIGNAL ANALYSIS REPORT =====\n\n"
        )

        f.write(
            f"Input File: {filename}\n"
        )

        f.write(
            f"Total Samples: "
            f"{features['samples']}\n"
        )

        f.write(
            f"Mean Amplitude: "
            f"{features['mean_amplitude']:.4f}\n"
        )

        f.write(
            f"Amplitude STD: "
            f"{features['amplitude_std']:.4f}\n"
        )

        f.write(
            f"I STD: "
            f"{features['I_std']:.4f}\n"
        )

        f.write(
            f"Q STD: "
            f"{features['Q_std']:.4f}\n\n"
        )

        f.write(
            f"Detected Modulation: "
            f"{modulation}\n"
        )

        f.write(
            f"Recovered Bits: "
            f"{len(recovered_bits)}\n"
        )

        f.write(
            f"Recovered Message: "
            f"{message}\n"
        )

    print(
        "    Report:",
        "output/final_analysis_report.txt"
    )

    print("\n" + "=" * 55)
    print("              PIPELINE COMPLETE")
    print("=" * 55)


if __name__ == "__main__":
    main()
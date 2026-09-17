import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
import os

# =========================================================
# PAGE CONFIGURATION
# =========================================================

st.set_page_config(
    page_title="Smart Signal Analyzer",
    page_icon="📡",
    layout="wide"
)

st.title("📡 Smart Signal Analysis & Demodulation System")
st.write(
    "Upload a signal file and analyze waveform, spectrum, "
    "constellation, modulation and recover the message."
)

# =========================================================
# FUNCTIONS
# =========================================================

def load_signal(file):
    """Load complex IQ signal from NPY file."""
    data = np.load(file)

    if not np.iscomplexobj(data):
        data = data.astype(np.complex64)

    return data


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


def detect_modulation(signal):

    I = np.real(signal)
    Q = np.imag(signal)
    amplitude = np.abs(signal)

    I_std = np.std(I)
    Q_std = np.std(Q)
    amplitude_std = np.std(amplitude)

    # BPSK candidate
    if Q_std < 0.01 and I_std > 0.1:
        return "BPSK"

    # QPSK candidate
    if Q_std > 0.1 and amplitude_std < 0.2:
        return "QPSK"

    # FSK candidate
    if Q_std > 0.1 and amplitude_std < 0.2:
        return "FSK"

    return "Unknown"


def bpsk_demodulate(signal):

    samples_per_symbol = 10
    bits = []

    for i in range(0, len(signal), samples_per_symbol):

        segment = signal[i:i + samples_per_symbol]

        if len(segment) < samples_per_symbol:
            break

        sample = segment[len(segment) // 2]

        if np.real(sample) >= 0:
            bits.append(1)
        else:
            bits.append(0)

    return np.array(bits)


def qpsk_demodulate(signal):

    samples_per_symbol = 10
    bits = []

    for i in range(0, len(signal), samples_per_symbol):

        segment = signal[i:i + samples_per_symbol]

        if len(segment) < samples_per_symbol:
            break

        sample = segment[len(segment) // 2]

        I = np.real(sample)
        Q = np.imag(sample)

        if I >= 0 and Q >= 0:
            pair = [0, 0]

        elif I < 0 and Q >= 0:
            pair = [0, 1]

        elif I < 0 and Q < 0:
            pair = [1, 1]

        else:
            pair = [1, 0]

        bits.extend(pair)

    return np.array(bits)


def fsk_demodulate(signal):

    sample_rate = 10000
    samples_per_symbol = 10

    f1 = 1000
    f2 = 2000

    bits = []

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
            bits.append(0)
        else:
            bits.append(1)

    return np.array(bits)


def bits_to_message(bits):

    message = ""

    usable_length = len(bits) - (len(bits) % 8)

    for i in range(0, usable_length, 8):

        byte = bits[i:i + 8]

        value = int("".join(map(str, byte)), 2)

        if 32 <= value <= 126:
            message += chr(value)
        else:
            message += "?"

    return message


# =========================================================
# FILE UPLOAD
# =========================================================

st.sidebar.header("📂 Input Signal")

uploaded_file = st.sidebar.file_uploader(
    "Upload Signal",
    type=["npy", "iq"]
)

# =========================================================
# ANALYSIS
# =========================================================

if uploaded_file is not None:

    # -----------------------------------------------------
    # LOAD NPY
    # -----------------------------------------------------

    if uploaded_file.name.endswith(".npy"):

        signal = load_signal(uploaded_file)

    # -----------------------------------------------------
    # LOAD IQ
    # -----------------------------------------------------

    else:

        raw_data = uploaded_file.read()

        signal = np.frombuffer(
            raw_data,
            dtype=np.complex64
        )

    if len(signal) == 0:

        st.error("Signal file is empty.")

    else:

        st.success("Signal loaded successfully!")

        # =================================================
        # SIGNAL INFORMATION
        # =================================================

        results = analyze_signal(signal)

        st.subheader("📊 Signal Information")

        col1, col2, col3, col4 = st.columns(4)

        col1.metric(
            "Samples",
            results["samples"]
        )

        col2.metric(
            "Mean Amplitude",
            f"{results['mean_amplitude']:.4f}"
        )

        col3.metric(
            "I STD",
            f"{results['I_std']:.4f}"
        )

        col4.metric(
            "Q STD",
            f"{results['Q_std']:.4f}"
        )

        # =================================================
        # MODULATION
        # =================================================

        modulation = detect_modulation(signal)

        st.subheader("🔍 Modulation Detection")

        st.info(
            f"Detected / Candidate Modulation: **{modulation}**"
        )

        # =================================================
        # WAVEFORM
        # =================================================

        st.subheader("📈 I/Q Waveform")

        I = np.real(signal)
        Q = np.imag(signal)

        fig, ax = plt.subplots()

        samples_to_show = min(2000, len(signal))

        ax.plot(I[:samples_to_show], label="I")
        ax.plot(Q[:samples_to_show], label="Q")

        ax.set_xlabel("Sample")
        ax.set_ylabel("Amplitude")
        ax.legend()
        ax.grid()

        st.pyplot(fig)

        # =================================================
        # FFT
        # =================================================

        st.subheader("📡 FFT Spectrum")

        fft_data = np.fft.fft(signal)

        magnitude = np.abs(fft_data)

        frequencies = np.fft.fftfreq(
            len(signal),
            d=1 / 10000
        )

        fig2, ax2 = plt.subplots()

        ax2.plot(
            np.fft.fftshift(frequencies),
            np.fft.fftshift(magnitude)
        )

        ax2.set_xlabel("Frequency (Hz)")
        ax2.set_ylabel("Magnitude")
        ax2.grid()

        st.pyplot(fig2)

        # =================================================
        # CONSTELLATION
        # =================================================

        st.subheader("💠 Constellation Diagram")

        fig3, ax3 = plt.subplots()

        points = signal[:5000]

        ax3.scatter(
            np.real(points),
            np.imag(points),
            s=5
        )

        ax3.set_xlabel("In-phase (I)")
        ax3.set_ylabel("Quadrature (Q)")
        ax3.grid()
        ax3.axhline(0)
        ax3.axvline(0)

        st.pyplot(fig3)

        # =================================================
        # DEMODULATION
        # =================================================

        st.subheader("🔄 Demodulation & Message Recovery")

        if modulation == "BPSK":

            bits = bpsk_demodulate(signal)

        elif modulation == "QPSK":

            bits = qpsk_demodulate(signal)

        elif modulation == "FSK":

            bits = fsk_demodulate(signal)

        else:

            bits = None

        if bits is not None:

            st.write(
                f"Recovered Bits: **{len(bits)}**"
            )

            st.code(
                "".join(map(str, bits[:100]))
            )

            message = bits_to_message(bits)

            st.success(
                f"Recovered Message: {message}"
            )

            # Download recovered bits

            bits_text = "".join(map(str, bits))

            st.download_button(
                "⬇️ Download Recovered Bits",
                bits_text,
                file_name="recovered_bits.txt"
            )

            # Download message

            st.download_button(
                "⬇️ Download Recovered Message",
                message,
                file_name="recovered_message.txt"
            )

        else:

            st.warning(
                "Demodulation not available because "
                "the modulation type could not be identified."
            )

else:

    st.info(
        "👈 Upload a .npy or .iq signal file from the sidebar."
    )
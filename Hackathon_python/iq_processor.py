import numpy as np
import os

def process_iq(filename):

    if not os.path.exists(filename):
        raise FileNotFoundError("IQ file not found.")

    # Read complex IQ data
    iq_signal = np.fromfile(filename, dtype=np.complex64)

    if len(iq_signal) == 0:
        raise ValueError("IQ file is empty.")

    # Remove DC offset
    iq_signal = iq_signal - np.mean(iq_signal)

    # Normalize
    max_value = np.max(np.abs(iq_signal))

    if max_value > 0:
        iq_signal = iq_signal / max_value

    return iq_signal


if __name__ == "__main__":

    filename = "output/signal.iq"

    try:

        iq_signal = process_iq(filename)

        print("===== IQ PROCESSING =====")
        print("Input File:", filename)
        print("IQ Samples:", len(iq_signal))
        print("Processing: Complete")

        os.makedirs("output", exist_ok=True)

        np.save("output/processed_iq.npy", iq_signal)

        print("Output saved: output/processed_iq.npy")

    except Exception as e:

        print("Error:", e)
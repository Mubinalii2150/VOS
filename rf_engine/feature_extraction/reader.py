import os
import numpy as np
from scipy.io import wavfile

class ReaderError(Exception):
    pass

def read_signal(file_path):
    if not os.path.exists(file_path):
        raise ReaderError("File not found")

    ext = os.path.splitext(file_path)[1].lower()

    # WAV
    if ext == ".wav":
        sr, data = wavfile.read(file_path)

        if data.ndim > 1:
            data = data.mean(axis=1)

        data = data.astype(np.float32)
        data /= np.max(np.abs(data)) + 1e-9

        return data, float(sr)

    # IQ (FLOAT32 INTERLEAVED)
    elif ext == ".iq":

        raw = np.fromfile(file_path, dtype=np.float32)

        if raw.size < 2:
            raise ReaderError("Invalid IQ file")

        # Even samples only
        raw = raw[: raw.size // 2 * 2]

        i = raw[0::2]
        q = raw[1::2]

        signal = i + 1j * q

        # Normalize
        signal = signal / (np.max(np.abs(signal)) + 1e-9)

        sample_rate = 2_400_000

        return signal.astype(np.complex64), float(sample_rate)

    else:
        raise ReaderError("Unsupported file")
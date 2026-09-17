
import numpy as np
from scipy.io import wavfile

def load_wav(path):
    sr, data = wavfile.read(path)
    original_dtype = str(data.dtype)
    channels = int(data.shape[1]) if data.ndim == 2 else 1
    data = data.astype(np.float64)
    if data.ndim == 2:
        data = data.mean(axis=1)
    peak = np.max(np.abs(data)) if data.size else 1.0
    if peak > 1.0: data /= peak
    return data.astype(np.complex128), int(sr), {"format":"WAV","channels":channels,"dtype":original_dtype}

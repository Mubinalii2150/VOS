import hashlib
import numpy as np

def generate_fingerprint(signal, sample_rate):
    signal = np.nan_to_num(signal)

    feature = np.concatenate([
        signal[:4096].astype(np.float32),
        np.array([sample_rate], dtype=np.float32)
    ])

    sha = hashlib.sha256(feature.tobytes()).hexdigest()

    return f"{sha[:4]}-{sha[4:8]}-{sha[8:12]}-{sha[12:16]}".upper()
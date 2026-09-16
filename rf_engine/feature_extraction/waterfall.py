from __future__ import annotations

import logging
import os
from typing import Tuple

import numpy as np
from scipy import signal

logger = logging.getLogger(__name__)


def generate_waterfall(sig: np.ndarray, sample_rate: float, output_dir: str = "output") -> str:
    """Generate waterfall (spectrogram matrix) and save as .npy

    Returns path to saved .npy
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    proc_sig = np.abs(sig) if np.iscomplexobj(sig) else sig
    f, t, Sxx = signal.spectrogram(proc_sig, fs=sample_rate, nperseg=1024)
    # Save the power spectrogram (dB)
    waterfall = 10 * np.log10(Sxx + 1e-12)
    out_path = os.path.join(output_dir, "waterfall.npy")
    np.save(out_path, waterfall)
    return out_path

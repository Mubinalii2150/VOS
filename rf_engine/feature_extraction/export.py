from __future__ import annotations

import json
import logging
import os
from typing import Dict, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def save_feature_vector(features: Dict[str, object], output_dir: str = "output") -> str:
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "feature_vector.json")
    with open(out_path, "w", encoding="utf8") as f:
        json.dump(features, f, indent=2)
    return out_path


def save_waveform_csv(sig: np.ndarray, sample_rate: float, output_dir: str = "output") -> str:
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    t = np.arange(len(sig)) / float(sample_rate)
    amp = np.real(sig) if np.iscomplexobj(sig) else sig

    # Instantaneous frequency from phase derivative
    if np.iscomplexobj(sig):
        phase = np.angle(sig)
        unwrapped = np.unwrap(phase)
        inst_freq = np.concatenate(([0.0], np.diff(unwrapped))) * (sample_rate / (2.0 * np.pi))
    else:
        inst_freq = np.zeros_like(amp)

    power = amp ** 2
    df = pd.DataFrame({"time": t, "amplitude": amp, "frequency": inst_freq, "power": power})
    out_path = os.path.join(output_dir, "waveform.csv")
    df.to_csv(out_path, index=False)
    return out_path

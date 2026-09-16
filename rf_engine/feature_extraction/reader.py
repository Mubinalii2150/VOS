from __future__ import annotations

import logging
import os
from typing import Tuple

import numpy as np
import wavio
from scipy.io import wavfile

logger = logging.getLogger(__name__)


class ReaderError(Exception):
    pass


def read_signal(file_path: str) -> Tuple[np.ndarray, float]:
    """Auto-detect and read .wav or .iq files.

    Returns a numpy array (complex for IQ, float for WAV) and sample_rate.
    """
    if not os.path.exists(file_path):
        raise ReaderError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".wav":
        try:
            sr, data = wavfile.read(file_path)
            # Normalize to float32 in -1..1
            if data.dtype == np.int16:
                data = data.astype(np.float32) / 32768.0
            elif data.dtype == np.int32:
                data = data.astype(np.float32) / 2147483648.0
            elif data.dtype == np.uint8:
                data = (data.astype(np.float32) - 128) / 128.0
            else:
                data = data.astype(np.float32)
            # If stereo, take mean
            if data.ndim > 1:
                data = data.mean(axis=1)
            return data, float(sr)
        except Exception as e:
            logger.exception("Failed to read wav file")
            raise ReaderError(str(e))

    elif ext == ".iq":
        try:
            # Assume float32 interleaved I,Q
            raw = np.fromfile(file_path, dtype=np.float32)
            if raw.size % 2 != 0:
                # Try int16
                raw = np.fromfile(file_path, dtype=np.int16).astype(np.float32)
                raw /= 32768.0
            i = raw[0::2]
            q = raw[1::2]
            complex_sig = i + 1j * q
            # Try to infer sample rate from filename, default 48000
            sr = _infer_sample_rate_from_filename(file_path) or 48000
            return complex_sig.astype(np.complex64), float(sr)
        except Exception as e:
            logger.exception("Failed to read IQ file")
            raise ReaderError(str(e))

    else:
        raise ReaderError(f"Unsupported extension: {ext}")


def _infer_sample_rate_from_filename(path: str) -> int | None:
    basename = os.path.basename(path).lower()
    parts = basename.replace(".", "_").split("_")
    for p in parts:
        if p.endswith("hz") and p[:-2].isdigit():
            return int(p[:-2])
        if p.endswith("khz") and p[:-3].isdigit():
            return int(p[:-3]) * 1000
        if p.isdigit() and len(p) >= 3:
            # heuristic
            return int(p)
    return None

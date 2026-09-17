
import numpy as np, os

def load_iq(path, dtype_hint=None):
    raw = np.fromfile(path, dtype=np.float32 if dtype_hint is None else dtype_hint)
    if raw.size == 0: raise ValueError("IQ file is empty")
    # Most raw IQ captures are interleaved I,Q float32. Complex dtypes are also supported.
    if np.iscomplexobj(raw):
        samples = raw.astype(np.complex128)
    elif raw.size >= 2:
        samples = raw[0::2].astype(np.float64) + 1j*raw[1::2].astype(np.float64)
    else:
        samples = raw.astype(np.complex128)
    scale=np.max(np.abs(samples))
    if scale: samples=samples/scale
    return samples, 1.0, {"format":"RAW IQ","sample_encoding":"interleaved float32","samples":int(len(samples))}

def load_iq_auto(path):
    size=os.path.getsize(path)
    for dt in (np.float32, np.int16):
        try:
            raw=np.fromfile(path,dtype=dt)
            if raw.size >= 2 and raw.size <= 100_000_000:
                s=raw[0::2].astype(float)+1j*raw[1::2].astype(float)
                mag=np.abs(s)
                if np.isfinite(mag).all() and np.mean(mag) > 0:
                    s=s/(np.max(mag) or 1)
                    return s, 1.0, {"format":"RAW IQ","sample_encoding":np.dtype(dt).name,"bytes":size}
        except Exception: pass
    raise ValueError("Unsupported or corrupted IQ file")

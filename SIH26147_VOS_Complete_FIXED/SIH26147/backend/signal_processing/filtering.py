
import numpy as np
from scipy.signal import butter, sosfiltfilt

def preprocess(samples, sample_rate, highpass=None, lowpass=None):
    x=np.asarray(samples).astype(np.complex128)
    x=x-np.mean(x)
    if sample_rate and (highpass or lowpass):
        nyq=sample_rate/2
        lo=(highpass/nyq) if highpass else 0
        hi=(lowpass/nyq) if lowpass else .999
        if 0 < lo < hi < 1:
            x=sosfiltfilt(butter(5,[lo,hi],btype="band",output="sos"),x)
    scale=np.max(np.abs(x))
    return x/(scale or 1)


import numpy as np
from scipy.signal import find_peaks

def fft_analysis(samples, sample_rate):
    x=np.asarray(samples); n=len(x)
    if n==0: raise ValueError("No samples")
    window=np.hanning(n)
    spec=np.fft.fftshift(np.fft.fft(x*window))
    freq=np.fft.fftshift(np.fft.fftfreq(n,d=1.0/sample_rate))
    mag=20*np.log10(np.maximum(np.abs(spec)/(np.sum(window)+1e-12),1e-12))
    peaks,_=find_peaks(mag,distance=max(1,n//200),prominence=3)
    order=peaks[np.argsort(mag[peaks])[-10:]] if len(peaks) else []
    return {"frequency_hz":freq.tolist(),"magnitude_db":mag.tolist(),
            "peak_frequencies_hz":freq[order].tolist(),"peak_magnitudes_db":mag[order].tolist()}

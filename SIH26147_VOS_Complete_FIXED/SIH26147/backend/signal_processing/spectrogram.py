
import numpy as np
from scipy.signal import spectrogram

def spectrogram_analysis(samples, sample_rate, nperseg=1024):
    x=np.asarray(samples)
    if len(x)<8: return {"time_s":[],"frequency_hz":[],"power_db":[]}
    nperseg=min(nperseg,len(x)); noverlap=nperseg//2
    f,t,S=spectrogram(x,fs=sample_rate,nperseg=nperseg,noverlap=noverlap,return_onesided=False,mode="complex")
    S=np.fft.fftshift(S,axes=0); f=np.fft.fftshift(f)
    p=20*np.log10(np.maximum(np.abs(S),1e-12))
    return {"time_s":t.tolist(),"frequency_hz":f.tolist(),"power_db":p.tolist()}

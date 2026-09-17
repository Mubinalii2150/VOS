
import numpy as np
from scipy.stats import skew, kurtosis
def extract_features(x, fs):
    x=np.asarray(x); mag=np.abs(x)
    power=float(np.mean(mag**2)); rms=float(np.sqrt(power))
    f=np.fft.fftfreq(len(x),1/fs); X=np.abs(np.fft.fft(x))
    pos=f>=0; fp=f[pos]; xp=X[pos]
    centroid=float(np.sum(fp*xp)/(np.sum(xp)+1e-12))
    bandwidth=float(np.sqrt(np.sum(((fp-centroid)**2)*xp)/(np.sum(xp)+1e-12)))
    phase=np.unwrap(np.angle(x))
    return {"samples":int(len(x)),"duration_s":float(len(x)/fs),"sample_rate_hz":float(fs),
            "mean_amplitude":float(np.mean(mag)),"rms":rms,"power":power,
            "peak_amplitude":float(np.max(mag)),"crest_factor":float(np.max(mag)/(rms+1e-12)),
            "spectral_centroid_hz":centroid,"spectral_bandwidth_hz":bandwidth,
            "phase_mean":float(np.mean(phase)),"amplitude_skewness":float(skew(mag)) if len(mag)>2 else 0,
            "amplitude_kurtosis":float(kurtosis(mag)) if len(mag)>3 else 0}

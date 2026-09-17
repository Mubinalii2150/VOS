
import numpy as np
from scipy.signal import hilbert
def detect_fsk(x,fs):
    phase=np.unwrap(np.angle(hilbert(np.real(x))))
    inst=np.diff(phase)*fs/(2*np.pi)
    if len(inst)<20:return {"detected":False,"confidence":0.0,"frequency_deviation_hz":0}
    q=np.percentile(inst,[10,90]); sep=abs(q[1]-q[0])
    conf=float(min(0.99, sep/(np.std(inst)+sep+1e-9)))
    return {"detected":bool(sep>2*np.std(inst)*.5),"confidence":conf,"frequency_deviation_hz":float(sep/2)}


import numpy as np
def detect_psk(x,fs):
    z=np.asarray(x); ph=np.angle(z[1:]*np.conj(z[:-1])); d=np.abs(np.angle(np.exp(1j*ph)))
    # BPSK-like phase transitions cluster near pi; QPSK has four quadrant states.
    bpsk=float(np.mean(np.cos(ph)<-0.5)) if len(ph) else 0
    qpsk=float(np.mean((np.abs(ph)>np.pi/4)&(np.abs(ph)<3*np.pi/4))) if len(ph) else 0
    if bpsk>0.25: return {"type":"BPSK/PSK","confidence":min(.99,.5+bpsk/2)}
    if qpsk>0.25: return {"type":"QPSK/PSK","confidence":min(.99,.5+qpsk/2)}
    return {"type":"PSK candidate","confidence":.2}

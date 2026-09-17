
import numpy as np
def bits_to_bytes(bits):
    b=np.asarray(bits,dtype=np.uint8)[:len(bits)//8*8].reshape(-1,8)
    return np.packbits(b,axis=1,bitorder="big").ravel() if len(b) else np.array([],dtype=np.uint8)
def extract_bitstream(samples,modulation="auto"):
    from modulation.demodulator import demodulate
    bits=demodulate(samples,modulation)
    return bits.astype(np.uint8)

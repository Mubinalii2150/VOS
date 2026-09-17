
import numpy as np
def demodulate(x, modulation="auto"):
    z=np.asarray(x)
    if modulation.lower().startswith("fsk"):
        return (np.diff(np.unwrap(np.angle(z)))>=0).astype(np.uint8)
    if modulation.lower().startswith(("bpsk","psk")):
        return (z.real>=0).astype(np.uint8)
    # QAM/QPSK generic hard decision using I sign bits.
    if modulation.lower().startswith(("qam","qpsk")):
        bits=np.column_stack([(z.real>=0).astype(np.uint8),(z.imag>=0).astype(np.uint8)]).ravel()
        return bits
    return (z.real>=0).astype(np.uint8)


import numpy as np
def entropy(bits):
    b=np.asarray(bits,dtype=np.uint8)
    if not len(b): return 0.0
    p=np.bincount(b,minlength=2)/len(b)
    return float(-sum(v*np.log2(v) for v in p if v>0))

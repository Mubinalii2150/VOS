
import numpy as np
def deinterleave(data,kind="block",rows=4,seed=26147):
    a=np.asarray(data)
    if kind=="pseudo_random":
        rng=np.random.default_rng(seed); p=rng.permutation(len(a)); out=np.empty_like(a); out[p]=a; return out
    if kind=="block":
        rows=max(1,int(rows)); cols=int(np.ceil(len(a)/rows)); return a[:rows*cols].reshape(cols,rows).T.ravel()[:len(a)]
    return a

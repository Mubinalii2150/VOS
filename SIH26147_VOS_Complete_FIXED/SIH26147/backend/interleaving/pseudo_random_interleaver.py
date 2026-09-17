
import numpy as np
def pseudo_random_interleaver(data,seed=26147):
    a=np.asarray(data); rng=np.random.default_rng(seed); return a[rng.permutation(len(a))]

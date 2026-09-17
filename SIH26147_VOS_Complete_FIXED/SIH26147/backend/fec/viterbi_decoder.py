
import numpy as np
def viterbi_decode(received,generators=(0o7,0o5),constraint=3):
    r=np.asarray(received,dtype=np.uint8); nout=len(generators); n=r.size//nout
    if n==0:return np.array([],dtype=np.uint8)
    states=1<<(constraint-1); inf=10**9
    metric=np.full(states,inf); metric[0]=0
    paths=[[] for _ in range(states)]
    for t in range(n):
        obs=r[t*nout:(t+1)*nout]; nm=np.full(states,inf); npth=[None]*states
        for s in range(states):
            if metric[s]>=inf: continue
            for bit in (0,1):
                full=((s<<1)|bit)&((1<<constraint)-1); ns=full&(states-1)
                expected=np.array([bin(full&g).count("1")%2 for g in generators])
                cost=int(np.sum(expected!=obs)); val=metric[s]+cost
                if val<nm[ns]: nm[ns]=val; npth[ns]=paths[s]+[bit]
        metric,paths=nm,npth
    best=int(np.argmin(metric)); return np.array(paths[best] or [],dtype=np.uint8)

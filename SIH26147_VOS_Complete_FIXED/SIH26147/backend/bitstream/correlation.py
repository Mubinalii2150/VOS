
import numpy as np
def autocorrelation(bits,max_lag=128):
    x=np.asarray(bits,dtype=float); x=x-(x.mean() if len(x) else 0)
    if not len(x): return {"lags":[],"values":[]}
    max_lag=min(max_lag,len(x)-1); den=np.dot(x,x)+1e-12
    vals=[float(np.dot(x[:len(x)-k],x[k:])/den) for k in range(max_lag+1)]
    return {"lags":list(range(max_lag+1)),"values":vals}

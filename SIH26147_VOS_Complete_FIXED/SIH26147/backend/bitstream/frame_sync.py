
import numpy as np
def find_sync(bits,preamble=None):
    b=np.asarray(bits,dtype=np.uint8)
    p=np.asarray(preamble if preamble is not None else [1,0,1,0,1,0,1,0],dtype=np.uint8)
    if len(b)<len(p): return {"found":False,"index":-1,"confidence":0}
    scores=np.convolve(2*b-1, (2*p-1)[::-1], mode="valid")
    i=int(np.argmax(scores)); conf=float((scores[i]+len(p))/(2*len(p)))
    return {"found":conf>=.8,"index":i,"confidence":conf,"preamble_length":len(p)}


import numpy as np
from .convolutional import encode
def detect_fec(bits):
    b=np.asarray(bits,dtype=np.uint8)
    results=[]
    if len(b)>=32 and len(b)%2==0:
        d=b.reshape(-1,2)
        # Test whether a simple rate-1/2 convolutional code can explain the stream.
        from .viterbi_decoder import viterbi_decode
        dec=viterbi_decode(b)
        rec=encode(dec)
        ber=float(np.mean(rec[:len(b)]!=b)) if len(rec) else 1
        results.append({"code":"Convolutional (rate 1/2, K=3)","confidence":float(max(0,1-ber*2)),"estimated_ber":ber})
    from .reed_solomon import analyze_rs
    from .ldpc_decoder import analyze_ldpc
    results += [analyze_rs(b),analyze_ldpc(b)]
    best=max(results,key=lambda x:x.get("confidence",0)) if results else {"code":"Unknown","confidence":0}
    return {"classification":best.get("code","Unknown"),"confidence":float(best.get("confidence",0)),"candidates":results}

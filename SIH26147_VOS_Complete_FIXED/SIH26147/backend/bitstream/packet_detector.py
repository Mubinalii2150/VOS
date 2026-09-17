
import numpy as np
def detect_packets(bits,min_len=16):
    b=np.asarray(bits,dtype=np.uint8)
    if not len(b): return []
    runs=[]; start=0
    for i in range(1,len(b)):
        if i-start>=min_len and i%8==0 and np.mean(b[start:i]) in (0.0,1.0):
            runs.append({"start":start,"end":i,"length":i-start})
            start=i
    if len(b)-start>=min_len:runs.append({"start":start,"end":len(b),"length":len(b)-start})
    return runs

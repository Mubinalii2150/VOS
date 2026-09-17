
import numpy as np
def block_interleaver(data, rows=4):
    a=np.asarray(data); rows=max(1,int(rows)); cols=int(np.ceil(len(a)/rows))
    padded=np.pad(a,(0,rows*cols-len(a)),constant_values=0)
    return padded.reshape(rows,cols).T.ravel()


import numpy as np
def diagonal_interleaver(data,rows=4):
    a=np.asarray(data); cols=int(np.ceil(len(a)/rows)); p=np.pad(a,(0,rows*cols-len(a)))
    m=p.reshape(rows,cols); return np.array([m[(c-r)%rows,c] for c in range(cols) for r in range(rows)])

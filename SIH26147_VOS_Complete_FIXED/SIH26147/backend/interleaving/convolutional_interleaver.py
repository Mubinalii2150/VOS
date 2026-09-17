
import numpy as np
def convolutional_interleaver(data,depth=4):
    a=np.asarray(data); out=np.zeros_like(a); 
    for i,v in enumerate(a): out[i]=a[(i+depth*(i%(depth)) )%len(a)] if len(a) else v
    return out

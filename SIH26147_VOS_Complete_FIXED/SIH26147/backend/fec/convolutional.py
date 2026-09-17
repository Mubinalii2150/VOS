
import numpy as np
def encode(bits,generators=(0o7,0o5),constraint=3):
    state=0; out=[]
    for bit in np.asarray(bits,dtype=np.uint8):
        state=((state<<1)|int(bit))&((1<<constraint)-1)
        out.extend([(bin(state&g).count("1")%2) for g in generators])
    return np.array(out,dtype=np.uint8)

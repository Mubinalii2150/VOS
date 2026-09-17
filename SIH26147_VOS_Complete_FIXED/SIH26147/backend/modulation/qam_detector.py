
import numpy as np
def detect_qam(x,fs):
    z=np.asarray(x); z=z/(np.sqrt(np.mean(abs(z)**2))+1e-12)
    if len(z)<20:return {"type":"QAM candidate","confidence":.1,"order":0}
    # quantized I/Q occupancy; rectangular multi-level constellations indicate QAM.
    levels_i=len(np.unique(np.round(z.real,1))); levels_q=len(np.unique(np.round(z.imag,1)))
    order=16 if levels_i>=3 and levels_q>=3 else 4 if levels_i>=2 and levels_q>=2 else 0
    return {"type":f"{order}-QAM" if order else "QAM candidate","confidence":min(.95,(levels_i+levels_q)/20) if order else .15,"order":order}

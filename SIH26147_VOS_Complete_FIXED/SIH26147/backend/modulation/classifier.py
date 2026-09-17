
from .fsk_detector import detect_fsk
from .psk_detector import detect_psk
from .qam_detector import detect_qam
def classify(x,fs):
    a=detect_fsk(x,fs); p=detect_psk(x,fs); q=detect_qam(x,fs)
    candidates=[("FSK",a["confidence"] if a["detected"] else a["confidence"]*.5),
                (p["type"],p["confidence"]),(q["type"],q["confidence"])]
    name,conf=max(candidates,key=lambda v:v[1])
    return {"classification":name,"confidence":float(conf),"candidates":[{"type":n,"confidence":float(c)} for n,c in candidates],
            "fsk":a,"psk":p,"qam":q}

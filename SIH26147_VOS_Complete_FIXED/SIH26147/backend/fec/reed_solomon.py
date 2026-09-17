
def analyze_rs(bits):
    n=len(bits)
    return {"detected":False,"code":"Reed-Solomon candidate","confidence":0.0,
            "reason":"RS parameters cannot be reliably inferred from an unlabeled raw bitstream; byte-aligned structure is required.","input_bits":n}

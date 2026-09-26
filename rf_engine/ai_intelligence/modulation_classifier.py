import re

def to_float(value):
    if isinstance(value, (int, float)):
        return float(value)

    if value is None:
        return 0.0

    s = str(value)
    num = re.findall(r"[-+]?\d*\.?\d+", s)

    return float(num[0]) if num else 0.0


def classify_modulation(features):

    bandwidth = to_float(features.get("bandwidth"))
    snr = to_float(features.get("snr"))
    entropy = to_float(features.get("spectral_entropy"))

    if bandwidth > 0.8 and snr > 10:
        mod = "OFDM"
        conf = 96

    elif bandwidth > 0.3 and entropy > 3:
        mod = "QPSK"
        conf = 91

    elif bandwidth > 0.1:
        mod = "BPSK"
        conf = 84

    elif snr > 5:
        mod = "FM"
        conf = 72

    else:
        mod = "AM"
        conf = 60

    return {
        "type": mod,
        "confidence": conf,
        "symbol_rate": round(bandwidth * 1000, 1),
        "quality": "Excellent" if conf >= 90 else "Good"
    }
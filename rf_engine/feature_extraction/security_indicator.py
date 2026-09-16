from __future__ import annotations

import logging
from typing import Dict

logger = logging.getLogger(__name__)


def rf_integrity_score(snr_db: float) -> Dict[str, object]:
    """Map SNR to a risk level, color, and confidence.

    Confidence is a heuristic 0..1 representing how far into the bin the SNR is.
    """
    if snr_db >= 20.0:
        level = "LOW"
        color = "GREEN"
        conf = min(100.0, (snr_db - 20.0) / 20.0 * 100.0 + 75.0)
    elif 10.0 <= snr_db < 20.0:
        level = "MEDIUM"
        color = "YELLOW"
        conf = ((snr_db - 10.0) / 10.0) * 100.0
    elif 5.0 <= snr_db < 10.0:
        level = "HIGH"
        color = "ORANGE"
        conf = ((snr_db - 5.0) / 5.0) * 100.0
    else:
        level = "CRITICAL"
        color = "RED"
        conf = max(0.0, 50.0 - abs(snr_db))

    conf = float(max(0.0, min(100.0, conf)))

    return {"risk_level": level, "color": color, "confidence": conf}

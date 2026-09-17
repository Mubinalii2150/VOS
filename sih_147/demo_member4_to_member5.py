from __future__ import annotations
import sys
from pathlib import Path
import numpy as np

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.generators import generate_bpsk, generate_qpsk, generate_2fsk
from modulation_classification.classifier import ModulationClassifier
from demodulation_engine.demodulators import demodulate


def _ber(tx: np.ndarray, rx: np.ndarray) -> float:
    n = min(len(tx), len(rx))
    if n == 0:
        return 1.0
    a, b = tx[:n], rx[:n]
    return min(float(np.mean(a != b)), float(np.mean(a != (1 - b))))


def run_one(name: str, gen_fn, symbol_rate: float = 2400.0, sample_rate: float = 48000.0):
    print(f"\n{'='*60}")
    print(f"  Signal type : {name}")
    print(f"{'='*60}")

    sig, true_bits = gen_fn()
    print(f"  Samples     : {len(sig):,}")
    print(f"  True bits   : {len(true_bits)}")

    
    clf_result = clf.predict(sig, sample_rate)
    print(f"\n Detected modulation : {clf_result['modulation']}")
    print(f"  Confidence         : {clf_result['confidence']:.1%}")
    print(f"  Overall            : {clf_result['overall_confidence']}")
    print(f"  Top candidates     : {clf_result['candidates'][:3]}")


    try:
        demod = demodulate(
            sig,
            sample_rate,
            modulation=clf_result["modulation"],
            symbol_rate=symbol_rate,
        )
        print(f"\n Recovered symbols  : {demod.num_symbols}")
        print(f"  Recovered bits     : {len(demod.bits)}")
        print(f"  Estimated SNR      : {demod.snr_db:.1f} dB")
        print(f"  First 32 bits      : {''.join(map(str, demod.bits[:32]))}")

        if name in ("BPSK", "2-FSK"):
            ber = _ber(true_bits, demod.bits)
            print(f"Approx BER         : {ber:.3f}")
    except Exception as e:
        print(f"\nDemodulation failed : {e}")


if __name__ == "__main__":
    print("Training classifier (first run only, ~10 s)...")
    clf = ModulationClassifier()
    metrics = clf.fit_synthetic(n_per_class=80, seed=42)
    print(f"Classifier ready – held-out accuracy {metrics['test_accuracy']*100:.1f}%")

    sr, sym = 48_000.0, 2_400.0

    run_one("BPSK", lambda: generate_bpsk(400, sym, sr, snr_db=20))
    run_one("QPSK", lambda: generate_qpsk(400, sym, sr, snr_db=20))
    run_one("2-FSK", lambda: generate_2fsk(400, sym, sr, deviation_hz=sym * 0.35, snr_db=18))

    
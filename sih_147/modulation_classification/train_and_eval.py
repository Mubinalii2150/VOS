from __future__ import annotations
import sys
from pathlib import Path
import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from modulation_classification.classifier import ModulationClassifier
from shared.generators import generate_bpsk, generate_qpsk, generate_2fsk
from shared.enums import ModulationType


def main() -> None:
    print("=" * 60)
    print(" Training Modulation Classifier")
    print("=" * 60)

    clf = ModulationClassifier()
    metrics = clf.fit_synthetic(n_per_class=100, seed=42)
    print(f"\nHeld-out accuracy : {metrics['test_accuracy']*100:.1f}%")
    print(f"Training samples  : {metrics['n_train']}")
    print(f"Test samples      : {metrics['n_test']}")

    path = clf.save()
    print(f"Model saved to : {path}")

    # Accuracy vs SNR
    print("\nAccuracy vs SNR (BPSK / QPSK / 2-FSK):")
    print(f"{'SNR (dB)':>10}  {'BPSK':>8}  {'QPSK':>8}  {'2-FSK':>8}")
    sr, sym = 48_000.0, 2_400.0
    for snr in [0, 5, 10, 15, 20, 25]:
        scores = {}
        for name, gen in [
            ("BPSK", lambda: generate_bpsk(300, sym, sr, snr_db=snr)),
            ("QPSK", lambda: generate_qpsk(300, sym, sr, snr_db=snr)),
            ("2-FSK", lambda: generate_2fsk(300, sym, sr, deviation_hz=sym * 0.35, snr_db=snr)),
        ]:
            correct = 0
            trials = 15
            for _ in range(trials):
                sig, _ = gen()
                pred = clf.predict(sig, sr)
                if pred["modulation"] == name or (
                    name == "2-FSK" and pred["modulation"] == ModulationType.FSK2.value
                ):
                    correct += 1
            scores[name] = correct / trials
        print(f"{snr:>10}  {scores['BPSK']*100:>7.0f}%  {scores['QPSK']*100:>7.0f}%  {scores['2-FSK']*100:>7.0f}%")

    print("\nDone. Member 4 is ready to hand over to Member 5.")


if __name__ == "__main__":
    main()

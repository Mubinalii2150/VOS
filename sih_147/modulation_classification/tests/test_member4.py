"""Unit tests for Member 4 – Modulation Classification."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from member_4_modulation_classification.features import extract_features
from member_4_modulation_classification.classifier import ModulationClassifier, classify_modulation
from shared.generators import generate_bpsk, generate_qpsk, generate_2fsk
from shared.enums import ModulationType


@pytest.fixture(scope="module")
def trained_clf() -> ModulationClassifier:
    clf = ModulationClassifier()
    metrics = clf.fit_synthetic(n_per_class=40, seed=7)
    assert metrics["test_accuracy"] > 0.55
    return clf


class TestFeatures:
    def test_shape(self):
        sig, _ = generate_bpsk(200, 2400, 48000)
        fv = extract_features(sig, 48000)
        assert fv.values.ndim == 1
        assert len(fv.values) == len(fv.names)
        assert len(fv.values) >= 15
        assert np.all(np.isfinite(fv.values))

    def test_scale_invariance(self):
        sig, _ = generate_qpsk(200, 2400, 48000)
        fv1 = extract_features(sig, 48000)
        fv2 = extract_features(sig * 4.0, 48000)
        assert np.median(np.abs(fv1.values - fv2.values)) < 0.2


class TestClassifier:
    def test_bpsk(self, trained_clf):
        sig, _ = generate_bpsk(400, 2400, 48000, snr_db=18)
        r = trained_clf.predict(sig, 48000)
        assert r["modulation"] in ("BPSK", "QPSK")
        assert r["confidence"] > 0.3

    def test_qpsk(self, trained_clf):
        sig, _ = generate_qpsk(400, 2400, 48000, snr_db=18)
        r = trained_clf.predict(sig, 48000)
        assert r["modulation"] != "Unknown"
        assert r["confidence"] > 0.3

    def test_2fsk(self, trained_clf):
        sig, _ = generate_2fsk(400, 2400, 48000, deviation_hz=800, snr_db=18)
        r = trained_clf.predict(sig, 48000)
        assert r["modulation"] != "Unknown"

    def test_noise(self, trained_clf):
        noise = (np.random.randn(4096) + 1j * np.random.randn(4096)).astype(np.complex64)
        r = trained_clf.predict(noise, 48000)
        assert r["confidence"] < 0.95 or r["modulation"] == "Unknown"

    def test_save_load(self, trained_clf, tmp_path):
        path = tmp_path / "clf.pkl"
        trained_clf.save(path)
        clf2 = ModulationClassifier(path)
        assert clf2.is_fitted
        sig, _ = generate_bpsk(300, 2400, 48000, snr_db=20)
        assert trained_clf.predict(sig, 48000)["modulation"] == clf2.predict(sig, 48000)["modulation"]

    def test_convenience(self):
        sig, _ = generate_qpsk(300, 2400, 48000, snr_db=15)
        r = classify_modulation(sig, 48000, train_if_needed=True)
        assert "modulation" in r and "confidence" in r

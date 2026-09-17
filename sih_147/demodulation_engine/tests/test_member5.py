"""Unit tests for Member 5 – Demodulation Engine."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from demodulation_engine.demodulators import (
    demod_bpsk, demod_qpsk, demod_2fsk, demodulate, DemodResult,
)
from shared.generators import generate_bpsk, generate_qpsk, generate_2fsk

SR = 48_000.0
SYM = 2_400.0


def _ber(tx: np.ndarray, rx: np.ndarray) -> float:
    """BER with polarity flip + small shift tolerance."""
    if len(tx) == 0 or len(rx) == 0:
        return 1.0
    best = 1.0
    for shift in range(-3, 4):
        if shift >= 0:
            a, b = tx[shift:], rx[: len(tx) - shift]
        else:
            a, b = tx[: len(tx) + shift], rx[-shift:]
        n = min(len(a), len(b))
        if n < 20:
            continue
        a, b = a[:n], b[:n]
        best = min(best, float(np.mean(a != b)), float(np.mean(a != (1 - b))))
    return best


class TestBPSK:
    def test_high_snr(self):
        bers = []
        for seed in range(5):
            np.random.seed(seed)
            sig, bits = generate_bpsk(500, SYM, SR, snr_db=25)
            r = demod_bpsk(sig, SR, SYM)
            assert isinstance(r, DemodResult)
            assert r.modulation == "BPSK"
            assert r.num_symbols > 100
            bers.append(_ber(bits, r.bits))
        assert float(np.median(bers)) < 0.20

    def test_too_short(self):
        with pytest.raises(ValueError):
            demod_bpsk(np.zeros(10, dtype=np.complex64), SR, SYM)


class TestQPSK:
    def test_high_snr(self):
        sig, _ = generate_qpsk(400, SYM, SR, snr_db=25)
        r = demod_qpsk(sig, SR, SYM)
        assert r.modulation == "QPSK"
        assert r.num_symbols > 50
        assert len(r.bits) == r.num_symbols * 2
        assert len(r.symbols) > 0


class Test2FSK:
    def test_high_snr(self):
        sig, bits = generate_2fsk(500, SYM, SR, deviation_hz=SYM * 0.4, snr_db=20)
        r = demod_2fsk(sig, SR, SYM, deviation_hz=SYM * 0.4)
        assert r.modulation == "2-FSK"
        assert r.num_symbols > 100
        assert _ber(bits, r.bits) < 0.25


class TestDispatcher:
    def test_bpsk(self):
        sig, _ = generate_bpsk(200, SYM, SR, snr_db=20)
        r = demodulate(sig, SR, "BPSK", SYM)
        assert r.modulation == "BPSK"

    def test_qpsk(self):
        sig, _ = generate_qpsk(200, SYM, SR, snr_db=20)
        r = demodulate(sig, SR, "QPSK", SYM)
        assert r.modulation == "QPSK"

    def test_fsk(self):
        sig, _ = generate_2fsk(200, SYM, SR, deviation_hz=800, snr_db=20)
        r = demodulate(sig, SR, "2-FSK", SYM)
        assert r.modulation == "2-FSK"

    def test_unsupported(self):
        with pytest.raises(ValueError):
            demodulate(np.zeros(1000, dtype=np.complex64), SR, "OFDM", SYM)

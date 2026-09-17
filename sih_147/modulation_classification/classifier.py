"""
 Modulation Classifier
"""
from __future__ import annotations
import pickle
import sys
from pathlib import Path
from typing import Any
import numpy as np

# Allow running both as package and as standalone scripts
_HERE = Path(__file__).resolve().parent
_ROOT = _HERE.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from shared.enums import ConfidenceLevel, ModulationType
from modulation_classification.features import extract_features

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    from sklearn.pipeline import Pipeline
    _HAS_SKLEARN = True
except ImportError:  # pragma: no cover
    _HAS_SKLEARN = False


SUPPORTED = [ModulationType.BPSK, ModulationType.QPSK, ModulationType.FSK2, ModulationType.UNKNOWN]
_DEFAULT_MODEL = _HERE / "models" / "mod_clf.pkl"


class ModulationClassifier:
    

    def __init__(self, model_path: Path | str | None = None) -> None:
        self.model_path = Path(model_path) if model_path else _DEFAULT_MODEL
        self.pipeline: Any = None
        self.label_encoder: Any = None
        self.is_fitted = False
        if self.model_path.exists():
            self.load(self.model_path)

    
    def fit_synthetic(
        self,
        n_per_class: int = 120,
        snr_range: tuple[float, float] = (0.0, 25.0),
        sample_rate: float = 48_000.0,
        symbol_rate: float = 2_400.0,
        seed: int = 42,
    ) -> dict[str, float]:
        """Train on synthetic BPSK / QPSK / 2-FSK + noise."""
        if not _HAS_SKLEARN:
            raise RuntimeError("Install scikit-learn: pip install scikit-learn")

        from shared.generators import generate_bpsk, generate_qpsk, generate_2fsk
        from shared.channels import add_awgn, add_frequency_offset

        rng = np.random.default_rng(seed)
        X, y = [], []

        def _aug(sig: np.ndarray) -> np.ndarray:
            snr = float(rng.uniform(*snr_range))
            sig = add_awgn(sig, snr)
            if rng.random() < 0.4:
                offset = float(rng.uniform(-0.05, 0.05) * sample_rate)
                sig = add_frequency_offset(sig, sample_rate, offset)
            if len(sig) > 4096:
                start = int(rng.integers(0, len(sig) - 2048))
                sig = sig[start : start + 4096]
            return sig

        for _ in range(n_per_class):
            sig, _ = generate_bpsk(400, symbol_rate, sample_rate)
            X.append(extract_features(_aug(sig), sample_rate).values)
            y.append(ModulationType.BPSK.value)

        for _ in range(n_per_class):
            sig, _ = generate_qpsk(400, symbol_rate, sample_rate)
            X.append(extract_features(_aug(sig), sample_rate).values)
            y.append(ModulationType.QPSK.value)

        for _ in range(n_per_class):
            sig, _ = generate_2fsk(400, symbol_rate, sample_rate, deviation_hz=symbol_rate * 0.35)
            X.append(extract_features(_aug(sig), sample_rate).values)
            y.append(ModulationType.FSK2.value)

        for _ in range(n_per_class // 2):
            noise = (rng.standard_normal(4096) + 1j * rng.standard_normal(4096)).astype(np.complex64)
            X.append(extract_features(noise, sample_rate).values)
            y.append(ModulationType.UNKNOWN.value)

        X_arr = np.stack(X)
        y_arr = np.array(y)

        self.label_encoder = LabelEncoder()
        y_enc = self.label_encoder.fit_transform(y_arr)

        idx = rng.permutation(len(X_arr))
        split = int(0.8 * len(idx))
        train_idx, test_idx = idx[:split], idx[split:]

        self.pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(
                n_estimators=120, max_depth=12, min_samples_leaf=3,
                n_jobs=-1, random_state=seed, class_weight="balanced",
            )),
        ])
        self.pipeline.fit(X_arr[train_idx], y_enc[train_idx])
        self.is_fitted = True

        pred = self.pipeline.predict(X_arr[test_idx])
        acc = float(np.mean(pred == y_enc[test_idx]))
        return {"test_accuracy": acc, "n_train": int(len(train_idx)), "n_test": int(len(test_idx))}

    
    def predict(self, samples: np.ndarray, sample_rate: float, top_k: int = 3) -> dict:
        """Return a dict ready for the rest of the pipeline / GUI."""
        if not self.is_fitted or self.pipeline is None:
            return self._heuristic(samples, sample_rate)

        feat = extract_features(samples, sample_rate).values.reshape(1, -1)
        proba = self.pipeline.predict_proba(feat)[0]
        classes = self.label_encoder.classes_
        order = np.argsort(proba)[::-1]

        candidates = [
            {"label": str(classes[i]), "confidence": float(proba[i])}
            for i in order[:top_k]
        ]
        best_label = str(classes[order[0]])
        best_conf = float(proba[order[0]])

        try:
            mod = ModulationType(best_label)
        except ValueError:
            mod = ModulationType.UNKNOWN

        if best_conf >= 0.85:
            overall = ConfidenceLevel.CONFIRMED
        elif best_conf >= 0.65:
            overall = ConfidenceLevel.PROBABLE
        elif best_conf >= 0.40:
            overall = ConfidenceLevel.POSSIBLE
        else:
            overall = ConfidenceLevel.UNKNOWN

        return {
            "modulation": mod.value,
            "confidence": best_conf,
            "candidates": candidates,
            "overall_confidence": overall.value,
        }

    def _heuristic(self, samples: np.ndarray, sample_rate: float) -> dict:
        """Fallback when no model is loaded."""
        return {
            "modulation": ModulationType.UNKNOWN.value,
            "confidence": 0.3,
            "candidates": [{"label": "Unknown", "confidence": 0.3}],
            "overall_confidence": ConfidenceLevel.UNSUPPORTED.value,
            "warnings": ["Heuristic only – model not fitted"],
        }

    
    def save(self, path: Path | str | None = None) -> Path:
        path = Path(path) if path else self.model_path
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump({"pipeline": self.pipeline, "label_encoder": self.label_encoder}, f)
        return path

    def load(self, path: Path | str) -> None:
        with open(path, "rb") as f:
            data = pickle.load(f)
        self.pipeline = data["pipeline"]
        self.label_encoder = data["label_encoder"]
        self.is_fitted = True
        self.model_path = Path(path)


# Convenience singleton
_global: ModulationClassifier | None = None


def classify_modulation(samples: np.ndarray, sample_rate: float, train_if_needed: bool = True) -> dict:
    """One-call API used by the rest of the system."""
    global _global
    if _global is None:
        _global = ModulationClassifier()
        if not _global.is_fitted and train_if_needed and _HAS_SKLEARN:
            _global.fit_synthetic(n_per_class=80)
            try:
                _global.save()
            except Exception:
                pass
    return _global.predict(samples, sample_rate)

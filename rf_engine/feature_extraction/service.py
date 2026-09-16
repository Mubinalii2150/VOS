from __future__ import annotations

"""Service entrypoint exposing `extract_signal_features`.

Public API:
 - extract_signal_features(file_path: str) -> dict
"""

import logging
import os
from typing import Dict

from . import export, features, fft, quality, reader, security_indicator, spectrogram, waterfall

logger = logging.getLogger(__name__)


def extract_signal_features(file_path: str, output_dir: str = "output") -> Dict[str, object]:
    """Main entrypoint to extract signal features from a file.

    Args:
        file_path: Path to .wav or .iq file
        out_dir: Directory to save outputs

    Returns:
        Dictionary of features and metadata.
    """
    try:
        sig, sr = reader.read_signal(file_path)
        q = quality.analyze_signal_quality(sig, sr)
        s = fft.analyze_spectrum(sig, sr, output_dir=output_dir)
        spec_img = spectrogram.generate_spectrogram(sig, sr, output_dir=output_dir)
        waterfall_path = waterfall.generate_waterfall(sig, sr, output_dir=output_dir)
        # Additional visualizations
        fft_img = spectrogram.generate_fft_spectrum(sig, sr, output_dir=output_dir)
        waterfall_png = spectrogram.generate_waterfall_image(sig, sr, output_dir=output_dir)
        waveform_png = spectrogram.generate_waveform_plot(sig, sr, output_dir=output_dir)
        adv = features.extract_advanced_features(sig, sr, s)
        security = security_indicator.rf_integrity_score(q.get("snr_db", -999.0))

        feature_vector = {**q, **s, **adv}

        export_paths = {
            "feature_vector_json": export.save_feature_vector(feature_vector, output_dir=output_dir),
            "waveform_csv": export.save_waveform_csv(sig, sr, output_dir=output_dir),
            "fft_npy": os.path.join(output_dir, "fft.npy"),
            "spectrogram_png": os.path.join(output_dir, "spectrogram.png"),
            "waterfall_npy": os.path.join(output_dir, "waterfall.npy"),
            "fft_spectrum_png": fft_img,
            "waterfall_png": waterfall_png,
            "waveform_png": waveform_png,
        }

        # Flattened result expected by callers/tests
        result: Dict[str, object] = {}
        result["sample_rate"] = float(sr)
        result["num_samples"] = int(len(sig))
        result["rms_power"] = float(q.get("rms_power"))
        result["peak_amplitude"] = float(q.get("peak_amplitude"))
        result["energy"] = float(q.get("energy"))
        result["noise_floor"] = float(q.get("noise_floor"))
        result["snr"] = float(q.get("snr_db"))
        result["dynamic_range_db"] = float(q.get("dynamic_range_db"))
        result["dc_offset_real"] = float(q.get("dc_offset_real"))
        result["dc_offset_imag"] = float(q.get("dc_offset_imag"))

        # Spectrum / advanced
        result["dominant_frequency"] = float(s.get("dominant_freq")) if s.get("dominant_freq") is not None else float(adv.get("dominant_frequency", 0.0))
        result["bandwidth"] = float(s.get("occupied_bandwidth", adv.get("bandwidth", 0.0)))
        result["centre_frequency"] = float(s.get("centre_freq", 0.0))
        result["total_spectral_power"] = float(s.get("total_spectral_power", 0.0))

        result["spectral_entropy"] = float(adv.get("spectral_entropy", 0.0))
        result["spectral_centroid"] = float(adv.get("spectral_centroid", 0.0))
        result["spectral_flatness"] = float(adv.get("spectral_flatness", 0.0))

        # Security
        result["risk_level"] = security.get("risk_level")
        result["color"] = security.get("color")
        result["confidence"] = float(security.get("confidence"))

        result["exports"] = export_paths

        # Save combined feature vector JSON for downstream use
        export.save_feature_vector(result, output_dir=output_dir)

        return result
    except Exception as e:
        logger.exception("Failed to extract features")
        raise

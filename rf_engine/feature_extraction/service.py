import os
import numpy as np

from .reader import read_signal
from .quality import analyze_signal_quality
from .fft import analyze_spectrum
from .security_indicator import rf_integrity_score
from .export import save_feature_vector, save_waveform_csv
from .spectrogram import (
    generate_fft_spectrum,
    generate_spectrogram,
    generate_waterfall_image,
    generate_waveform_plot,
)


def extract_signal_features(file_path, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    signal, sample_rate = read_signal(file_path)
    signal = np.nan_to_num(signal)

    quality = analyze_signal_quality(signal, sample_rate)
    spectrum = analyze_spectrum(signal, sample_rate, output_dir)

    # Security analysis
    security = rf_integrity_score(quality["snr_db"])

    # Generate images
    generate_fft_spectrum(signal, sample_rate, output_dir)
    generate_spectrogram(signal, sample_rate, output_dir)
    generate_waterfall_image(signal, sample_rate, output_dir)
    generate_waveform_plot(signal, sample_rate, output_dir)

    feature_vector = {
        "sample_rate": sample_rate,
        **quality,
        **spectrum,
        **security,
    }

    save_feature_vector(feature_vector, output_dir)
    save_waveform_csv(signal, sample_rate, output_dir)

    return {
        "signal_strength": int(min(100, quality["rms_power"] * 100)),

        "center_frequency":
            f"{spectrum['centre_freq']/1e6:.3f} MHz"
            if sample_rate >= 1_000_000
            else f"{spectrum['centre_freq']:.1f} Hz",

        "bandwidth":
            f"{spectrum['occupied_bandwidth']/1e6:.3f} MHz"
            if sample_rate >= 1_000_000
            else f"{spectrum['occupied_bandwidth']/1e3:.2f} kHz",

        "security_score": security.get("confidence", 0),
        "threat": security.get("risk_level", "UNKNOWN"),

        "fft_image": "/output/fft_spectrum.png",
        "spectrogram_image": "/output/spectrogram.png",
        "waterfall_image": "/output/waterfall.png",
        "waveform_image": "/output/waveform.png",

        "snr": quality["snr_db"],
        "noise_floor": quality["noise_floor"],
        "dynamic_range": quality["dynamic_range_db"],
        "rms_power": quality["rms_power"],
    }
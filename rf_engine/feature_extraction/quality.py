import numpy as np

def analyze_signal_quality(signal, sample_rate):
    if np.iscomplexobj(signal):
        x = np.abs(signal)
    else:
        x = signal.astype(np.float32)

    x = np.nan_to_num(x)

    rms = float(np.sqrt(np.mean(x**2)))
    peak = float(np.max(np.abs(x)))
    energy = float(np.sum(x**2))

    # Bottom 10% samples se noise estimate
    sorted_x = np.sort(np.abs(x))
    n = max(10, len(sorted_x) // 10)
    noise_floor = float(np.mean(sorted_x[:n]))

    if noise_floor < 1e-6:
        noise_floor = 1e-6

    snr = 20 * np.log10((rms + 1e-9) / noise_floor)
    dynamic_range = 20 * np.log10((peak + 1e-9) / noise_floor)

    # Clamp realistic values
    snr = np.clip(snr, 0, 60)
    dynamic_range = np.clip(dynamic_range, 0, 96)

    return {
        "rms_power": round(rms, 4),
        "peak_amplitude": round(peak, 4),
        "energy": round(energy, 2),
        "noise_floor": round(noise_floor, 6),
        "snr_db": round(float(snr), 2),
        "dynamic_range_db": round(float(dynamic_range), 2),
    }
# Feature Extraction Engine

Python module to extract AI-ready features from .wav and .iq signal files.

Usage:

```python
from feature_extraction.service import extract_signal_features

result = extract_signal_features("path/to/file.wav", output_dir="output")
print(result["snr"])  # example
```

Outputs written to `output/`:
- `fft.npy`, `spectrogram.png`, `waterfall.npy`, `feature_vector.json`, `waveform.csv`

Requirements: Python 3.11+, see `requirements.txt`.

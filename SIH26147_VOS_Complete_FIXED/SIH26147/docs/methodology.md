# Methodology
1. Validate extension and upload.
2. Decode WAV or interleaved raw float32/int16 IQ.
3. Remove DC and optionally filter.
4. Compute FFT and spectrogram.
5. Extract time-domain and spectral features.
6. Evaluate FSK/PSK/QAM candidates.
7. Hard-demodulate the selected candidate and analyze the resulting bits.
8. Search for synchronization, packet boundaries, recognizable framing and statistical structure.
9. Evaluate a known simple convolutional-code hypothesis and report RS/LDPC as candidates only when their required code parameters are unavailable.
10. Persist visualizations and a JSON report.

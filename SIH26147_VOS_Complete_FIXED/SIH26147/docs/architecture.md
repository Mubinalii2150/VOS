# Architecture
Browser React client calls Flask REST endpoints. Flask persists uploads, executes the signal pipeline, caches analysis by file ID, and stores generated FFT/spectrogram/report artifacts. Numerical processing is isolated into signal_processing, modulation, bitstream, fec, and interleaving packages.

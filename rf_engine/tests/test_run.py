import sys
from pathlib import Path
import pathlib

# Ensure project root is on sys.path for direct execution
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from feature_extraction.service import extract_signal_features


features = extract_signal_features(
    file_path="sample_test.wav",
    output_dir="output",
)

print(features)

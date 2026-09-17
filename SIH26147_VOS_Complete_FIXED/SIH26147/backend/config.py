
import os
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = Path(os.getenv("UPLOAD_FOLDER", BASE_DIR / "uploads"))
OUTPUT_FOLDER = Path(os.getenv("OUTPUT_FOLDER", BASE_DIR / "outputs"))
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "100"))
MAX_CONTENT_LENGTH = MAX_UPLOAD_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {".wav", ".iq"}
for d in (UPLOAD_FOLDER, OUTPUT_FOLDER / "fft_plots", OUTPUT_FOLDER / "spectrograms", OUTPUT_FOLDER / "reports", OUTPUT_FOLDER / "decoded_bits"):
    d.mkdir(parents=True, exist_ok=True)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

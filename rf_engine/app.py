from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import math

from feature_extraction.service import extract_signal_features
from utils.audio_converter import iq_to_wav, wav_to_audio
from database.db import init_db, save_report, get_reports

app = Flask(__name__)
CORS(app)

# =====================================================
# PATHS
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# =====================================================
# DATABASE
# =====================================================

init_db()

# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():
    return jsonify({
        "server": "VOS RF Engine",
        "status": "ONLINE"
    })

# =====================================================
# ANALYZE RF FILE
# =====================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    if "file" not in request.files:
        return jsonify({
            "status": "failed",
            "error": "No file uploaded"
        }), 400

    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        return jsonify({
            "status": "failed",
            "error": "Empty filename"
        }), 400

    filename = uploaded_file.filename
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".wav", ".iq"]:
        return jsonify({
            "status": "failed",
            "error": "Only .wav and .iq supported"
        }), 400

    save_path = os.path.join(UPLOAD_DIR, filename)
    uploaded_file.save(save_path)

    try:

        # ---------------- RF Feature Extraction ----------------

        features = extract_signal_features(
            file_path=save_path,
            output_dir=OUTPUT_DIR
        )

        # ---------------- Audio Recovery ----------------

        if ext == ".iq":
            iq_to_wav(save_path, OUTPUT_DIR)
        else:
            wav_to_audio(save_path, OUTPUT_DIR)

        # ---------------- JSON Safe ----------------

        for key, value in list(features.items()):
            if isinstance(value, float) and not math.isfinite(value):
                features[key] = 0.0

        features["filename"] = filename

        # ---------------- SQLite Save ----------------

        save_report(
            filename=filename,
            signal=features["signal_strength"],
            threat=features["threat"],
            score=features["security_score"],
            fingerprint=features["fingerprint"],
        )

        # ---------------- Response ----------------

        return jsonify({
            "status": "success",

            "features": features,

            "audio": "/output/decoded_audio.wav",

            "images": {
                "fft": "/output/fft_spectrum.png",
                "spectrogram": "/output/spectrogram.png",
                "waterfall": "/output/waterfall.png",
                "waveform": "/output/waveform.png"
            },

            "vault": {
                "file": filename,
                "location": "Local SQLite Vault"
            }
        })

    except Exception as exc:

        print("RF ENGINE ERROR:", exc, flush=True)

        return jsonify({
            "status": "failed",
            "error": str(exc)
        }), 500

# =====================================================
# REPORT HISTORY
# =====================================================

@app.route("/history")
def history():

    rows = get_reports()

    result = []

    for r in rows:
        result.append({
            "file": r[0],
            "signal": r[1],
            "score": r[2],
            "threat": r[3],
            "time": r[4]
        })

    return jsonify(result)

# =====================================================
# OUTPUT FILES
# =====================================================

@app.route("/output/<path:filename>")
def output_file(filename):
    return send_from_directory(OUTPUT_DIR, filename)

# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        use_reloader=False
    )
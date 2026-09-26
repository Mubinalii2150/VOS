from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import math

# RF Engine
from feature_extraction.service import extract_signal_features
from utils.audio_converter import iq_to_wav, wav_to_audio

# Database
from database.matcher import match_fingerprint
from database.db import init_db, save_report, get_reports

# AI Modules
from ai_intelligence.speech_to_text import transcribe_audio
from ai_intelligence.threat_detector import detect_threat
from ai_intelligence.modulation_classifier import classify_modulation

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
        "version": "2.0",
        "status": "ONLINE"
    })

# =====================================================
# ANALYZE RF SIGNAL
# =====================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    if "file" not in request.files:
        return jsonify({
            "status": "failed",
            "error": "No file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "status": "failed",
            "error": "Empty filename"
        }), 400

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".wav", ".iq"]:
        return jsonify({
            "status": "failed",
            "error": "Only .wav and .iq supported"
        }), 400

    save_path = os.path.join(UPLOAD_DIR, filename)
    file.save(save_path)
    

    try:

        # =================================================
        # 1. RF FEATURE EXTRACTION
        # =================================================

        features = extract_signal_features(
            file_path=save_path,
            output_dir=OUTPUT_DIR
        )

        device = match_fingerprint(features["fingerprint"])
        # =================================================
        # 2. AUDIO RECOVERY
        # =================================================

        if ext == ".iq":
            audio_file = iq_to_wav(save_path, OUTPUT_DIR)
        else:
            audio_file = wav_to_audio(save_path, OUTPUT_DIR)

        # =================================================
        # 3. AI SPEECH INTELLIGENCE
        # =================================================
        

        transcript = transcribe_audio(audio_file, OUTPUT_DIR)

        threat = detect_threat(transcript["text"])

        modulation = classify_modulation(features)
        # =================================================
        # JSON SAFE
        # =================================================

        for key, value in list(features.items()):
            if isinstance(value, float) and not math.isfinite(value):
                features[key] = 0.0

        features["filename"] = filename

        # =================================================
        # SAVE DATABASE
        # =================================================

        save_report(
            filename=filename,
            signal=features["signal_strength"],
            threat=threat["level"],
            score=features["security_score"],
            fingerprint=features["fingerprint"]
        )

        # =================================================
        # RESPONSE
        # =================================================

        return jsonify({

            "status": "success",
            "device_match": device,
            "features": features,

            "audio": "/output/decoded_audio.wav",

            "images": {
                "fft": "/output/fft_spectrum.png",
                "spectrogram": "/output/spectrogram.png",
                "waterfall": "/output/waterfall.png",
                "waveform": "/output/waveform.png"
            },

            "ai": {
               "transcript": transcript["text"],
               "language": transcript["language"],
               "confidence": transcript["confidence"],
               "threat_level": threat["level"],
               "keywords": threat["keywords"]
            },

            "modulation": {
              "type": modulation["type"],
              "confidence": modulation["confidence"],
              "symbol_rate": modulation["symbol_rate"],
              "quality": modulation["quality"]
            },

            "vault": {
                "file": filename,
                "location": "Local SQLite Evidence Vault",
                "saved": True
            }

        })

    except Exception as e:

        print("RF ENGINE ERROR:", e, flush=True)

        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500


# =====================================================
# HISTORY
# =====================================================

@app.route("/history")
def history():

    rows = get_reports()

    data = []

    for r in rows:
        data.append({
            "file": r[0],
            "signal": r[1],
            "score": r[2],
            "threat": r[3],
            "time": r[4]
        })

    return jsonify(data)


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

import json, logging, traceback
from pathlib import Path
import numpy as np
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import UPLOAD_FOLDER, OUTPUT_FOLDER, MAX_CONTENT_LENGTH, CORS_ORIGINS
from signal_processing.wav_loader import load_wav
from signal_processing.iq_loader import load_iq_auto
from signal_processing.filtering import preprocess
from signal_processing.fft_analysis import fft_analysis
from signal_processing.spectrogram import spectrogram_analysis
from signal_processing.feature_extraction import extract_features
from modulation.classifier import classify
from bitstream.extractor import extract_bitstream
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from datetime import datetime
from bitstream.entropy import entropy
from bitstream.correlation import autocorrelation
from bitstream.frame_sync import find_sync
from bitstream.packet_detector import detect_packets
from bitstream.protocol_identifier import identify_protocol
from fec.fec_detector import detect_fec

app=Flask(__name__); app.config["MAX_CONTENT_LENGTH"]=MAX_CONTENT_LENGTH
CORS(app,resources={r"/api/*":{"origins":CORS_ORIGINS}})
from api.upload import upload_bp
from api.analysis import analysis_bp
from api.bitstream import bitstream_bp
from api.modulation import modulation_bp
from api.fec import fec_bp
from api.interleaving import interleaving_bp
for _bp in (upload_bp,analysis_bp,bitstream_bp,modulation_bp,fec_bp,interleaving_bp): app.register_blueprint(_bp)
logging.basicConfig(level=logging.INFO,format="%(asctime)s %(levelname)s %(name)s %(message)s")
CACHE={}
def load_file(fid):
    p=UPLOAD_FOLDER/fid
    if not p.exists(): raise FileNotFoundError(fid)
    if p.suffix.lower()==".wav": return (*load_wav(p),p)
    return (*load_iq_auto(p),p)
def get_analysis(fid):
    if fid not in CACHE: analyze_file(fid)
    return CACHE[fid]
def analyze_file(fid):
    x,fs,meta,path=load_file(fid)
    x=preprocess(x,fs)
    fft=fft_analysis(x,fs)
    spec=spectrogram_analysis(x,fs)
    features=extract_features(x,fs)
    modulation=classify(x,fs)
    bits=extract_bitstream(x,modulation["classification"])
    bitinfo={"length":int(len(bits)),"ones":int(bits.sum()) if len(bits) else 0,
             "zeros":int(len(bits)-bits.sum()) if len(bits) else 0,
             "preview":"".join(map(str,bits[:512].tolist()))}
    bitinfo["entropy"]=entropy(bits); bitinfo["correlation"]=autocorrelation(bits)
    bitinfo["frame_sync"]=find_sync(bits); bitinfo["packets"]=detect_packets(bits)
    bitinfo["protocol"]=identify_protocol(bits)
    # Persist visualizations for reproducible reports and later downloads.
    fft_name=f"{Path(fid).stem}_fft.png"; spec_name=f"{Path(fid).stem}_spectrogram.png"
    plt.figure(figsize=(10,4)); plt.plot(fft["frequency_hz"],fft["magnitude_db"]); plt.xlabel("Frequency (Hz)"); plt.ylabel("Magnitude (dB)"); plt.title("FFT Spectrum"); plt.tight_layout(); plt.savefig(OUTPUT_FOLDER/"fft_plots"/fft_name,dpi=140); plt.close()
    plt.figure(figsize=(10,4)); plt.imshow(spec["power_db"],origin="lower",aspect="auto",extent=[spec["time_s"][0] if spec["time_s"] else 0,spec["time_s"][-1] if spec["time_s"] else 1,spec["frequency_hz"][0] if spec["frequency_hz"] else 0,spec["frequency_hz"][-1] if spec["frequency_hz"] else 1]); plt.xlabel("Time (s)"); plt.ylabel("Frequency (Hz)"); plt.title("Spectrogram"); plt.colorbar(label="dB"); plt.tight_layout(); plt.savefig(OUTPUT_FOLDER/"spectrograms"/spec_name,dpi=140); plt.close()
    result={"file":{"id":fid,"name":path.name,"metadata":meta},"features":features,
            "fft":fft,"spectrogram":spec,"modulation":modulation,
            "bitstream":bitinfo,"fec":detect_fec(bits),
            "visualizations":{"fft":f"/api/files/fft_plots/{fft_name}","spectrogram":f"/api/files/spectrograms/{spec_name}"},
            "interleaving":{"tested_methods":["Block","Convolutional","Diagonal","Pseudo-Random"],
                            "status":"Analysis requires known interleaver parameters; candidates retained for inspection."}}
    CACHE[fid]=result
    return result
@app.get("/api/health")
def health(): return jsonify(status="ok",service="SIH26147 Signal Analyzer")
@app.post("/api/report/<fid>")
def report(fid):
    a=get_analysis(fid)
    report_dir=OUTPUT_FOLDER/"reports"; report_dir.mkdir(exist_ok=True)
    out=report_dir/f"{Path(fid).stem}_report.json"
    out.write_text(json.dumps(a,indent=2),encoding="utf-8")
    return jsonify(report_url=f"/api/files/reports/{out.name}")
@app.get("/api/results/<fid>")
def results(fid):
    try:return jsonify(get_analysis(fid))
    except FileNotFoundError:return jsonify(error="File not found"),404
@app.get("/api/files/<path:filename>")
def files(filename): return send_from_directory(OUTPUT_FOLDER,filename)
@app.errorhandler(413)
def too_large(e): return jsonify(error="File exceeds configured upload limit"),413
@app.errorhandler(Exception)
def error(e):
    app.logger.exception("Unhandled error")
    return jsonify(error="Internal server error",detail=str(e)),500
if __name__=="__main__": app.run(host="0.0.0.0",port=5000)

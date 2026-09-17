
from flask import Blueprint, request, jsonify
from pathlib import Path
from config import UPLOAD_FOLDER
from utils import allowed_file, safe_filename
upload_bp=Blueprint("upload",__name__,url_prefix="/api")
@upload_bp.post("/upload")
def upload():
    if "file" not in request.files:return jsonify(error="No file field"),400
    f=request.files["file"]
    if not f.filename or not allowed_file(f.filename):return jsonify(error="Only .wav and .iq files are supported"),400
    name=safe_filename(f.filename); path=UPLOAD_FOLDER/name; f.save(path)
    return jsonify(file_id=name,filename=f.filename,size=path.stat().st_size)

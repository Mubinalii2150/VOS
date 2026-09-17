
from flask import Blueprint,request,jsonify,current_app
import numpy as np
analysis_bp=Blueprint("analysis",__name__,url_prefix="/api")
@analysis_bp.post("/analyze")
def analyze():
    from app import analyze_file
    data=request.get_json(silent=True) or {}
    fid=data.get("file_id")
    if not fid:return jsonify(error="file_id is required"),400
    try:return jsonify(analyze_file(fid))
    except FileNotFoundError:return jsonify(error="File not found"),404
    except Exception as e:
        current_app.logger.exception("Analysis failed")
        return jsonify(error=str(e)),422

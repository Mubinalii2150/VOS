
from flask import Blueprint,request,jsonify
bitstream_bp=Blueprint("bitstream",__name__,url_prefix="/api")
@bitstream_bp.get("/bitstream/<file_id>")
def bitstream(file_id):
    from app import get_analysis
    a=get_analysis(file_id)
    return jsonify(a.get("bitstream",{}))


from flask import Blueprint,jsonify
fec_bp=Blueprint("fec",__name__,url_prefix="/api")
@fec_bp.get("/fec/<file_id>")
def fec(file_id):
    from app import get_analysis
    return jsonify(get_analysis(file_id).get("fec",{}))

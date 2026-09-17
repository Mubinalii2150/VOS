
from flask import Blueprint,jsonify
modulation_bp=Blueprint("modulation",__name__,url_prefix="/api")
@modulation_bp.get("/modulation/<file_id>")
def modulation(file_id):
    from app import get_analysis
    return jsonify(get_analysis(file_id).get("modulation",{}))


from flask import Blueprint,jsonify
interleaving_bp=Blueprint("interleaving",__name__,url_prefix="/api")
@interleaving_bp.get("/interleaving/<file_id>")
def interleaving(file_id):
    from app import get_analysis
    return jsonify(get_analysis(file_id).get("interleaving",{}))

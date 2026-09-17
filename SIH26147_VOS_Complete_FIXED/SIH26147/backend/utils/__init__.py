
from pathlib import Path
from uuid import uuid4
from werkzeug.utils import secure_filename
from config import ALLOWED_EXTENSIONS

def allowed_file(name: str) -> bool:
    return Path(name).suffix.lower() in ALLOWED_EXTENSIONS

def safe_filename(name: str) -> str:
    return f"{uuid4().hex}_{secure_filename(name)}"

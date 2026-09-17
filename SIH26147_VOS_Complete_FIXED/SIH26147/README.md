# VOS — SIH26147 Signal Analyzer

Full-stack reference implementation for automated analysis of `.IQ` and `.WAV` captures.

## Architecture
- **Backend:** Flask REST API, NumPy/SciPy signal processing, Matplotlib visualization.
- **Frontend:** React + Vite + Recharts.
- **Pipeline:** loading → preprocessing → FFT/spectrogram → features → modulation → demodulation/bitstream → synchronization/packet/protocol analysis → FEC/interleaving diagnostics → report.

## Supported APIs
- `GET /api/health`
- `POST /api/upload` with multipart field `file`
- `POST /api/analyze` JSON `{"file_id":"..."}`
- `GET /api/results/<file_id>`
- `POST /api/report/<file_id>`
- `GET /api/modulation/<file_id>`
- `GET /api/fec/<file_id>`
- `GET /api/interleaving/<file_id>`
- `GET /api/bitstream/<file_id>`

## Important engineering note
A raw IQ/WAV capture does not contain metadata that uniquely identifies every modulation, protocol, FEC family, or interleaver. The implementation therefore performs deterministic signal-derived candidate analysis and explicitly reports when a code-specific parameter (for example an LDPC parity-check matrix) is required. It does not claim unsupported identification.

## Run
### Backend (Windows)
```bat
cd SIH26147\backend
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### Frontend
```bat
cd SIH26147\frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

For a production frontend build:
```bat
npm run build
npm run preview
```
Set `VITE_API_URL` when the API is not on `http://localhost:5000/api`.

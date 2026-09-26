import os
from faster_whisper import WhisperModel

model = WhisperModel("tiny", device="cpu", compute_type="int8")

def transcribe_audio(audio_path, output_dir):
    segments, info = model.transcribe(audio_path, beam_size=1)

    # transcript banao
    text = " ".join([s.text for s in segments]).strip()

    if not text:
        text = "No speech detected"
        language = "N/A"
        confidence = 0
    else:
        language = info.language.upper()
        confidence = round(info.language_probability * 100, 2)

    os.makedirs(output_dir, exist_ok=True)

    with open(
        os.path.join(output_dir, "transcript.txt"),
        "w",
        encoding="utf-8"
    ) as f:
        f.write(text)

    return {
        "text": text,
        "language": language,
        "confidence": confidence
    }
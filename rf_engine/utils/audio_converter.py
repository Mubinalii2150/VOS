import os
import wave
import numpy as np

def save_wav(audio, sample_rate, out_path):
    audio = np.asarray(audio, dtype=np.float32)

    if len(audio) == 0:
        raise ValueError("Empty audio")

    audio /= np.max(np.abs(audio)) + 1e-9
    pcm = (audio * 32767).astype(np.int16)

    with wave.open(out_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm.tobytes())

    return out_path


def wav_to_audio(wav_path, out_dir):
    out_path = os.path.join(out_dir, "decoded_audio.wav")

    with wave.open(wav_path, "rb") as src:
        params = src.getparams()
        frames = src.readframes(src.getnframes())

    with wave.open(out_path, "wb") as dst:
        dst.setparams(params)
        dst.writeframes(frames)

    return out_path


def iq_to_wav(iq_path, out_dir, sample_rate=48000):
    raw = np.fromfile(iq_path, dtype=np.complex64)

    if len(raw) == 0:
        raise ValueError("Invalid IQ file")

    # FM-style phase demodulation
    phase = np.unwrap(np.angle(raw))
    audio = np.diff(phase)

    return save_wav(
        audio,
        sample_rate,
        os.path.join(out_dir, "decoded_audio.wav")
    )
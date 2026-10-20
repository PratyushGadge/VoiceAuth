import os
import tempfile
import wave
from flask import Flask, jsonify, request
import numpy as np
from transformers import pipeline

app = Flask(__name__)
print("Loading VoiceAuth STT model (Whisper)...")
stt_pipeline = pipeline(
    task="automatic-speech-recognition", model="openai/whisper-base"
)
print("STT Model loaded successfully!")

@app.route("/", methods=["GET"])
def index():
  return jsonify({
      "system": "VoiceAuth Kiosk STT Backend",
      "status": "online",
      "endpoint": "/transcribe (POST)",
  })

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
  if "file" not in request.files:
    return (
        jsonify({
            "error": (
                "No audio file attached."
            )
        }),
        400,
    )
  audio_file = request.files["file"]
  if audio_file.filename == "":
    return jsonify({"error": "Selected file has no filename."}), 400

  with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
    temp_audio_path = temp_audio.name
    audio_file.save(temp_audio_path)

  try:
    with wave.open(temp_audio_path, "rb") as wf:
      sample_rate = wf.getframerate()
      n_channels = wf.getnchannels()
      sample_width = wf.getsampwidth()
      n_frames = wf.getnframes()
      audio_bytes = wf.readframes(n_frames)

    if sample_width == 1:
      dtype = np.uint8
    elif sample_width == 2:
      dtype = np.int16
    elif sample_width == 4:
      dtype = np.int32
    else:
      dtype = np.int16

    audio_np = np.frombuffer(audio_bytes, dtype=dtype).astype(np.float32)

    if dtype == np.uint8:
      audio_np = (audio_np - 128.0) / 128.0
    elif dtype == np.int16:
      audio_np /= 32768.0
    elif dtype == np.int32:
      audio_np /= 2147483648.0

    if n_channels > 1:
      audio_np = audio_np.reshape(-1, n_channels).mean(axis=1)

    input_payload = {"raw": audio_np, "sampling_rate": sample_rate}
    result = stt_pipeline(input_payload)
    transcription_text = result.get("text", "").strip()
    return jsonify({
        "status": "success",
        "transcription": transcription_text,
        "next_step": "Extract entity data (Student Name, Order ID, App) from text",
    })

  except Exception as e:
    return jsonify({"status": "error", "message": str(e)}), 500

  finally:
    if os.path.exists(temp_audio_path):
      os.remove(temp_audio_path)

if __name__ == "__main__":
  app.run()

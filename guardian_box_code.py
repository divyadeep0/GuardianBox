import cv2
import torch
import whisper
import threading
import requests
import time
import sounddevice as sd
import numpy as np
from flask import Flask, render_template_string
from geopy.geocoders import Nominatim

yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
whisper_model = whisper.load_model("base")

def get_location():
    try:
        response = requests.get("https://ipinfo.io/json").json()
        loc = response.get("loc", "0,0").split(",")
        lat, lon = loc[0], loc[1]
        city = response.get("city", "Unknown")
        return f"{city} ({lat}, {lon})"
    except:
        return "Location unavailable"

def detect_audio():
    duration = 5
    while True:
        recording = sd.rec(int(duration * 16000), samplerate=16000, channels=1, dtype='float32')
        sd.wait()
        audio = np.squeeze(recording)
        result = whisper_model.transcribe(audio, fp16=False)
        if any(word in result['text'].lower() for word in ['help', 'save me', 'gun', 'knife', 'kill']):
            global alert_audio
            alert_audio = f"Alert: {result['text']}"
        time.sleep(2)

def detect_video():
    global alert_video
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        results = yolo_model(frame)
        for *box, conf, cls in results.xyxy[0]:
            label = results.names[int(cls)]
            if label in ['knife', 'gun']:
                alert_video = f"Weapon Detected: {label}"
        time.sleep(1)

app = Flask(__name__)
alert_video = "No threats detected"
alert_audio = "No threats detected"
location = get_location()

@app.route('/')
def index():
    return render_template_string("""
        <h1>Guardian Box Safety Monitoring System</h1>
        <h2>Status Dashboard</h2>
        <p><strong>System Status:</strong> Active and Monitoring</p>
        <p><strong>Location:</strong> {{ location }}</p>
        <p><strong>Audio Alert:</strong> {{ audio }}</p>
        <p><strong>Video Alert:</strong> {{ video }}</p>
    """, location=location, audio=alert_audio, video=alert_video)

if __name__ == '__main__':
    threading.Thread(target=detect_audio, daemon=True).start()
    threading.Thread(target=detect_video, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)

import cv2
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
import os
import time
import pynmea2
import serial
import threading
from flask import Flask, Response, request, jsonify
from ultralytics import YOLO
import speech_recognition as sr
import requests

os.makedirs("logs", exist_ok=True)
os.makedirs("detections", exist_ok=True)
os.makedirs("audio", exist_ok=True)

app = Flask(_name_)
model = YOLO("yolov8n.pt")
camera = cv2.VideoCapture(0)
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

latitude, longitude = None, None
BAD_WORDS = ["badword1", "badword2", "badword3"]

def read_gps():
    global latitude, longitude
    try:
        ser = serial.Serial('/dev/serial0', 9600, timeout=1)
        while True:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line.startswith("$GPGGA"):
                msg = pynmea2.parse(line)
                latitude, longitude = msg.latitude, msg.longitude
    except Exception as e:
        print(f"GPS Error: {e}")

gps_thread = threading.Thread(target=read_gps, daemon=True)
gps_thread.start()

def log_alert(threat_type, detected_text=""):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    location = f"{latitude}, {longitude}" if latitude and longitude else "GPS not available"
    log_entry = f"[{timestamp}] ALERT: {threat_type} detected at {location}. Detected Text: {detected_text}\n"
    with open("logs/threat_log.txt", "a") as log_file:
        log_file.write(log_entry)
    print(log_entry)

def send_text_to_server(detected_text):
    try:
        server_url = "http://192.168.144.240:5000/alert"
        response = requests.post(server_url, json={"detected_text": detected_text})
        print(f"Sent detected text to server: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending text to server: {e}")

def record_audio_and_check_for_bad_words(filename="audio/threat_audio.wav", duration=5):
    fs = 44100
    print("🔴 Recording audio...")
    audio_data = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype="int16")
    sd.wait()
    wav.write(filename, fs, audio_data)
    print(f"✅ Audio saved: {filename}")
    detected_text = speech_to_text(filename)
    if detected_text:
        if any(bad_word in detected_text.lower() for bad_word in BAD_WORDS):
            log_alert("Bad word detected", detected_text)
            send_text_to_server(detected_text)

def speech_to_text(filename):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(filename) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        print(f"🎤 Detected Speech: {text}")
        return text
    except FileNotFoundError:
        print(f"❌ Error: File '{filename}' not found.")
        return ""
    except sr.UnknownValueError:
        print("❌ Google Speech Recognition could not understand the audio.")
        return ""
    except sr.RequestError as e:
        print(f"❌ Could not request results from Google Speech Recognition service; {e}")
        return ""

frame_skip = 5  
frame_count = 0

def detect_threat():
    global frame_count
    while True:
        ret, frame = camera.read()
        if not ret:
            continue
        frame_count += 1
        if frame_count % frame_skip != 0:
            continue
        results = model(frame)
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                label = model.names[class_id]
                conf = float(box.conf[0])
                if conf > 0.5 and label in ["knife", "gun"]:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    cv2.putText(frame, f"THREAT: {label}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    img_path = f"detections/threat_{int(time.time())}.jpg"
                    cv2.imwrite(img_path, frame)
                    log_alert(label)
                    threading.Thread(target=record_audio_and_check_for_bad_words, daemon=True).start()
        _, buffer = cv2.imencode(".jpg", frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(detect_threat(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/alert', methods=['POST'])
def alert():
    data = request.get_json()
    detected_text = data.get("detected_text", "")
    print(f"Received detected text: {detected_text}")
    return jsonify({"message": "Text received"}), 200

@app.route('/gps', methods=['GET'])
def get_gps():
    if latitude is not None and longitude is not None:
        return jsonify({"latitude": latitude, "longitude": longitude}), 200
    else:
        return jsonify({"error": "GPS data not available"}), 503

@app.route('/gps', methods=['POST'])
def receive_gps():
    data = request.get_json()
    global latitude, longitude
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    print(f"Received GPS data: {latitude}, {longitude}")
    return jsonify({"message": "GPS data received"}), 200

if _name_ == '_main_':
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

import cv2
import requests
import threading
import serial
import subprocess
import speech_recognition as sr
import torch
from torchvision import transforms
from PIL import Image
import numpy as np

TARGET_IP = "192.168.11.240"
model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
gps_serial = serial.Serial('/dev/serial0', baudrate=9600, timeout=1)

def stream_video():
    subprocess.run(["ffmpeg", "-f", "v4l2", "-i", "/dev/video0", "-f", "mpegts", f"udp://{TARGET_IP}:1234"])

def stream_audio():
    subprocess.run(["ffmpeg", "-f", "alsa", "-i", "hw:4,0", "-f", "mpegts", f"udp://{TARGET_IP}:1235"])

def detect_objects():
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        results = model(frame)
        labels = results.pandas().xyxy[0]['name'].tolist()
        if 'knife' in labels:
            requests.post(f"http://{TARGET_IP}/alert", json={"type": "object", "message": "Knife detected"})

def detect_bad_words():
    recognizer = sr.Recognizer()
    mic = sr.Microphone(device_index=4)
    bad_words = ["badword1", "badword2"]
    while True:
        with mic as source:
            recognizer.adjust_for_ambient_noise(source)
            audio = recognizer.listen(source)
        try:
            text = recognizer.recognize_google(audio).lower()
            if any(word in text for word in bad_words):
                requests.post(f"http://{TARGET_IP}/alert", json={"type": "audio", "message": "Bad word detected"})
        except:
            continue

def send_gps_data():
    while True:
        line = gps_serial.readline().decode('utf-8', errors='ignore')
        if "$GPGGA" in line:
            requests.post(f"http://{TARGET_IP}/gps", json={"type": "gps", "data": line})

threading.Thread(target=stream_video, daemon=True).start()
threading.Thread(target=stream_audio, daemon=True).start()
threading.Thread(target=detect_objects, daemon=True).start()
threading.Thread(target=detect_bad_words, daemon=True).start()
threading.Thread(target=send_gps_data, daemon=True).start()

while True:
    pass

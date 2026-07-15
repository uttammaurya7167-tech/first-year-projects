import os
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

model_path = "models/hand_landmarker.task"
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.IMAGE,
    num_hands=2
)
detector = vision.HandLandmarker.create_from_options(options)

# Create a blank image to test inference
dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=dummy_img)
result = detector.detect(mp_image)

print("Result keys:", dir(result))
print("Hand landmarks type:", type(result.hand_landmarks))
print("Handedness type:", type(result.handedness))

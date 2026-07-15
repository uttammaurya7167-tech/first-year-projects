"""
=============================================================
  Real-Time Webcam Facial Analysis + Hand Tracking
  ─────────────────────────────────────────────────
  Stack (Python 3.14 compatible – NO TensorFlow):
    • OpenCV        – webcam capture + face detection (DNN)
    • ONNX Runtime  – age / gender / emotion inference
    • MediaPipe     – modern HandLandmarker Tasks API

  How it works
  ────────────
  1. OpenCV grabs frames at full speed.
  2. MediaPipe processes every frame for hand landmarks using the
     modern HandLandmarker model.
  3. A background thread runs face detection + ONNX attribute
     inference every N frames so the live feed never freezes.
  4. All results are overlaid as a clean HUD.

  First run: model files are downloaded automatically
  into a local "models/" folder (~60 MB total).
=============================================================
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.vision import HandLandmarksConnections
import threading
import os
import urllib.request
import numpy as np
import onnxruntime as ort

# ─────────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────────
CAMERA_INDEX            = 0     # 0 = default webcam
ANALYSIS_EVERY_N_FRAMES = 10    # run face analysis every N frames
FRAME_WIDTH             = 1280
FRAME_HEIGHT            = 720
FONT                    = cv2.FONT_HERSHEY_SIMPLEX
MODELS_DIR              = os.path.join(os.path.dirname(__file__), "models")

# ─────────────────────────────────────────────
#  COLOUR PALETTE (BGR)
# ─────────────────────────────────────────────
C_ACCENT   = (0,  220, 255)    # cyan-yellow titles
C_TEXT     = (255, 255, 255)   # white body text
C_BOX_FACE = (0,  200, 100)    # green face box
C_BOX_HAND = (255, 140,   0)   # orange hand box
C_FINGER   = (200,  50, 255)   # purple raised-finger dots
C_SHADOW   = (0,    0,   0)    # drop-shadow

# ─────────────────────────────────────────────
#  MODEL URLS  (lightweight models)
# ─────────────────────────────────────────────
EMOTION_ONNX_URL = (
    "https://github.com/onnx/models/raw/main/validated/"
    "vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx"
)
HAND_LANDMARKER_URL = (
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/1/hand_landmarker.task"
)

AGE_LIST     = ["(0-2)", "(4-6)", "(8-12)", "(15-20)",
                "(25-32)", "(38-43)", "(48-53)", "(60-100)"]
GENDER_LIST  = ["Male", "Female"]
EMOTION_LIST = ["Neutral", "Happy", "Surprised", "Afraid",
                "Disgusted", "Angry", "Sad", "Contempt"]

# ══════════════════════════════════════════════
#  HELPER – draw text with drop-shadow
# ══════════════════════════════════════════════
def draw_text(frame, text, pos, font_scale=0.7, color=C_TEXT,
              thickness=2, shadow=True):
    x, y = pos
    if shadow:
        cv2.putText(frame, text, (x + 2, y + 2), FONT,
                    font_scale, C_SHADOW, thickness + 1, cv2.LINE_AA)
    cv2.putText(frame, text, (x, y), FONT,
                font_scale, color, thickness, cv2.LINE_AA)

# ══════════════════════════════════════════════
#  HELPER – semi-transparent label box
# ══════════════════════════════════════════════
def draw_label_box(frame, text, top_left, font_scale=0.6,
                   bg_color=(30, 30, 30), text_color=C_TEXT, alpha=0.6):
    (tw, th), baseline = cv2.getTextSize(text, FONT, font_scale, 2)
    pad = 6
    x1, y1 = top_left
    x2, y2 = x1 + tw + pad * 2, y1 + th + baseline + pad * 2
    h, w = frame.shape[:2]
    x2, y2 = min(x2, w - 1), min(y2, h - 1)
    roi = frame[y1:y2, x1:x2]
    if roi.size == 0:
        return (x2, y2)
    overlay = roi.copy()
    cv2.rectangle(overlay, (0, 0), (x2 - x1, y2 - y1), bg_color, -1)
    cv2.addWeighted(overlay, alpha, roi, 1 - alpha, 0, roi)
    frame[y1:y2, x1:x2] = roi
    cv2.putText(frame, text, (x1 + pad, y1 + th + pad), FONT,
                font_scale, text_color, 2, cv2.LINE_AA)
    return (x2, y2)

# ══════════════════════════════════════════════
#  HELPER – download a file if it doesn't exist
# ══════════════════════════════════════════════
def ensure_file(url: str, dest: str) -> bool:
    """Download `url` to `dest` if not already present. Returns True on success."""
    if os.path.exists(dest):
        return True
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print(f"  Downloading {os.path.basename(dest)} ...")
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp, \
             open(dest, "wb") as f:
            f.write(resp.read())
        print(f"  [OK] {os.path.basename(dest)} ready.")
        return True
    except Exception as e:
        print(f"  [ERROR] Failed to download {os.path.basename(dest)}: {e}")
        return False

# ══════════════════════════════════════════════
#  MODEL LOADER
#  Downloads and loads all inference models
# ══════════════════════════════════════════════
class Models:
    """
    Holds all loaded inference objects:
      - face_net   : OpenCV DNN face detector (SSD + ResNet-10)
      - age_net    : OpenCV DNN age classifier  (Caffe)
      - gender_net : OpenCV DNN gender classifier (Caffe)
      - emotion_session : ONNX Runtime session for emotion (FER+)
    """

    # File paths
    FACE_PROTO   = os.path.join(MODELS_DIR, "deploy.prototxt")
    FACE_CAFFE   = os.path.join(MODELS_DIR, "res10_300x300_ssd.caffemodel")
    AGE_PROTO    = os.path.join(MODELS_DIR, "age_deploy.prototxt")
    AGE_CAFFE    = os.path.join(MODELS_DIR, "age_net.caffemodel")
    GENDER_PROTO = os.path.join(MODELS_DIR, "gender_deploy.prototxt")
    GENDER_CAFFE = os.path.join(MODELS_DIR, "gender_net.caffemodel")
    EMOTION_ONNX = os.path.join(MODELS_DIR, "emotion-ferplus-8.onnx")
    HAND_TASK    = os.path.join(MODELS_DIR, "hand_landmarker.task")

    def __init__(self):
        self.face_net        = None
        self.age_net         = None
        self.gender_net      = None
        self.emotion_session = None
        self.ready           = False

    def download_all(self) -> bool:
        """Download all model files that are missing. Returns False on any failure."""
        os.makedirs(MODELS_DIR, exist_ok=True)

        downloads = [
            # Face detector (OpenCV official)
            ("https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt",
             self.FACE_PROTO),
            ("https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel",
             self.FACE_CAFFE),
            # Age (Levi & Hassner)
            ("https://raw.githubusercontent.com/spmallick/learnopencv/master/AgeGender/age_deploy.prototxt",
             self.AGE_PROTO),
            ("https://drive.google.com/uc?export=download&id=1kiusFljZc9QfcIYdU2s7xrtWHTraHwmW",
             self.AGE_CAFFE),
            # Gender (Levi & Hassner)
            ("https://raw.githubusercontent.com/spmallick/learnopencv/master/AgeGender/gender_deploy.prototxt",
             self.GENDER_PROTO),
            ("https://drive.google.com/uc?export=download&id=1W_moLzMlGiELyPxWiYQJ9KFaXroQ_NFQ",
             self.GENDER_CAFFE),
            # Emotion ONNX (FER+)
            (EMOTION_ONNX_URL, self.EMOTION_ONNX),
            # Modern Hand Landmarker (MediaPipe)
            (HAND_LANDMARKER_URL, self.HAND_TASK),
        ]

        for url, dest in downloads:
            if not ensure_file(url, dest):
                return False
        return True

    def load(self) -> bool:
        """Load all models into memory. Returns True on success."""
        try:
            self.face_net = cv2.dnn.readNetFromCaffe(
                self.FACE_PROTO, self.FACE_CAFFE)

            self.age_net = cv2.dnn.readNetFromCaffe(
                self.AGE_PROTO, self.AGE_CAFFE)

            self.gender_net = cv2.dnn.readNetFromCaffe(
                self.GENDER_PROTO, self.GENDER_CAFFE)

            self.emotion_session = ort.InferenceSession(
                self.EMOTION_ONNX,
                providers=["CPUExecutionProvider"],
            )

            self.ready = True
            print("[OK] All models loaded.")
            return True
        except Exception as e:
            print(f"[ERROR] Model load failed: {e}")
            return False

    # ──────────────────────────────────────────
    def detect_faces(self, frame):
        """
        Run OpenCV DNN face detection.
        Returns list of (x1, y1, x2, y2) in pixel coords.
        """
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)), 1.0,
            (300, 300), (104.0, 177.0, 123.0)
        )
        self.face_net.setInput(blob)
        dets = self.face_net.forward()

        boxes = []
        for i in range(dets.shape[2]):
            conf = dets[0, 0, i, 2]
            if conf < 0.6:          # confidence threshold
                continue
            x1 = int(dets[0, 0, i, 3] * w)
            y1 = int(dets[0, 0, i, 4] * h)
            x2 = int(dets[0, 0, i, 5] * w)
            y2 = int(dets[0, 0, i, 6] * h)
            # Clamp to frame
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            if x2 > x1 and y2 > y1:
                boxes.append((x1, y1, x2, y2))
        return boxes

    # ──────────────────────────────────────────
    def _face_blob(self, face_img):
        """Prepare a 227×227 blob from a face crop for age/gender nets."""
        MODEL_MEAN = (78.4263377603, 87.7689143744, 114.895847746)
        return cv2.dnn.blobFromImage(
            face_img, 1.0, (227, 227), MODEL_MEAN, swapRB=False
        )

    def predict_age(self, face_img) -> str:
        """Returns an age-range string like '(25-32)'."""
        self.age_net.setInput(self._face_blob(face_img))
        preds = self.age_net.forward()[0]
        return AGE_LIST[preds.argmax()]

    def predict_gender(self, face_img) -> str:
        """Returns 'Male' or 'Female'."""
        self.gender_net.setInput(self._face_blob(face_img))
        preds = self.gender_net.forward()[0]
        return GENDER_LIST[preds.argmax()]

    def predict_emotion(self, face_img) -> str:
        """
        Returns an emotion string.
        FER+ model expects: float32, shape (1,1,64,64), values in [0,255].
        """
        gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (64, 64)).astype(np.float32)
        blob = resized.reshape(1, 1, 64, 64)
        input_name = self.emotion_session.get_inputs()[0].name
        preds = self.emotion_session.run(None, {input_name: blob})[0][0]
        return EMOTION_LIST[preds.argmax()].capitalize()

# ══════════════════════════════════════════════
#  BACKGROUND FACE ANALYSIS THREAD
# ══════════════════════════════════════════════
class FaceAnalyzer:
    """
    Submits frames to a background thread for face detection +
    attribute inference. Main loop reads .result (cached) without
    blocking, keeping the video feed smooth.
    """

    def __init__(self, models: Models):
        self.models  = models
        self.result  = []      # list of dicts: {box, age, gender, emotion}
        self._lock   = threading.Lock()
        self._busy   = False

    def submit(self, frame):
        with self._lock:
            if self._busy:
                return
            self._busy = True
        threading.Thread(
            target=self._run, args=(frame.copy(),), daemon=True
        ).start()

    def _run(self, frame):
        try:
            faces = self.models.detect_faces(frame)
            results = []
            for (x1, y1, x2, y2) in faces:
                face_crop = frame[y1:y2, x1:x2]
                if face_crop.size == 0:
                    continue
                age     = self.models.predict_age(face_crop)
                gender  = self.models.predict_gender(face_crop)
                emotion = self.models.predict_emotion(face_crop)
                results.append({
                    "box":     (x1, y1, x2, y2),
                    "age":     age,
                    "gender":  gender,
                    "emotion": emotion,
                })
            with self._lock:
                self.result = results
        except Exception as e:
            pass   # keep showing last good result
        finally:
            with self._lock:
                self._busy = False

# ══════════════════════════════════════════════
#  FINGER COUNTER
# ══════════════════════════════════════════════
def count_raised_fingers(hand_landmarks, handedness_label):
    """
    Returns (total_raised, per_finger_list).
    Thumb: compared on x-axis (mirror-aware).
    Index–Pinky: tip y < PIP y  →  finger is up.
    """
    lm      = hand_landmarks
    tip_ids = [4,  8, 12, 16, 20]
    pip_ids = [3,  6, 10, 14, 18]

    fingers_up = []

    # Thumb
    if handedness_label == "Right":
        fingers_up.append(1 if lm[tip_ids[0]].x < lm[pip_ids[0]].x else 0)
    else:
        fingers_up.append(1 if lm[tip_ids[0]].x > lm[pip_ids[0]].x else 0)

    # Four fingers
    for i in range(1, 5):
        fingers_up.append(1 if lm[tip_ids[i]].y < lm[pip_ids[i]].y else 0)

    return sum(fingers_up), fingers_up

# ══════════════════════════════════════════════
#  MAIN APPLICATION
# ══════════════════════════════════════════════
def main():
    # ── Download + load models ────────────────
    print("[*] Checking models...")
    models = Models()
    if not models.download_all():
        print("[ERROR] Could not download all models. Check your internet connection.")
        return
    if not models.load():
        print("[ERROR] Could not load models.")
        return

    # ── Open webcam ───────────────────────────
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print("[ERROR] Cannot open webcam.")
        return
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  FRAME_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, 30)

    # ── Modern MediaPipe Hands Setup ──────────
    base_options = python.BaseOptions(model_asset_path=models.HAND_TASK)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        num_hands=2
    )
    detector = vision.HandLandmarker.create_from_options(options)

    # ── Background face analyser ──────────────
    analyzer    = FaceAnalyzer(models)
    frame_count = 0

    print("[OK] Camera ready.  Press  Q  to quit.")

    # ═══════════════════════════════════════
    #  MAIN LOOP
    # ═══════════════════════════════════════
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        frame_count += 1
        h, w = frame.shape[:2]
        frame = cv2.flip(frame, 1)   # mirror mode

        # Submit for background face analysis every N frames
        if frame_count % ANALYSIS_EVERY_N_FRAMES == 0:
            analyzer.submit(frame)

        # ─── FACE OVERLAY ────────────────────
        with analyzer._lock:
            faces = list(analyzer.result)

        for face in faces:
            x1, y1, x2, y2 = face["box"]
            cv2.rectangle(frame, (x1, y1), (x2, y2), C_BOX_FACE, 2)

            lines = [
                f"Age    : {face['age']}",
                f"Gender : {face['gender']}",
                f"Mood   : {face['emotion']}",
            ]
            label_y = max(y1 - 5, 10)
            for line in reversed(lines):
                draw_label_box(frame, line,
                               (x1, label_y - 28),
                               font_scale=0.6,
                               bg_color=(20, 80, 20),
                               text_color=C_ACCENT)
                label_y -= 30

        # ─── HAND TRACKING ───────────────────
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = detector.detect(mp_image)

        total_fingers = 0

        if result.hand_landmarks:
            for idx, hand_lm in enumerate(result.hand_landmarks):

                # ── Draw Skeleton Connections ──
                for conn in HandLandmarksConnections.HAND_CONNECTIONS:
                    p1 = hand_lm[conn.start]
                    p2 = hand_lm[conn.end]
                    x1, y1 = int(p1.x * w), int(p1.y * h)
                    x2, y2 = int(p2.x * w), int(p2.y * h)
                    cv2.line(frame, (x1, y1), (x2, y2), C_BOX_HAND, 2)

                # ── Draw Joints ──
                for lm in hand_lm:
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    cv2.circle(frame, (cx, cy), 5, C_ACCENT, -1)

                # Get handedness label
                label = "Right"
                if result.handedness and idx < len(result.handedness):
                    label = result.handedness[idx][0].category_name

                count, per_finger = count_raised_fingers(hand_lm, label)
                total_fingers += count

                # Bounding box around the hand
                xs  = [int(lm.x * w) for lm in hand_lm]
                ys  = [int(lm.y * h) for lm in hand_lm]
                hx1 = max(min(xs) - 20, 0)
                hy1 = max(min(ys) - 20, 0)
                hx2 = min(max(xs) + 20, w)
                hy2 = min(max(ys) + 20, h)

                cv2.rectangle(frame, (hx1, hy1), (hx2, hy2), C_BOX_HAND, 2)

                draw_label_box(frame, f"{label} Hand",
                               (hx1, hy2 + 5),
                               font_scale=0.6,
                               bg_color=(80, 40, 0),
                               text_color=(50, 200, 255))

                draw_label_box(frame, f"Fingers: {count}",
                               (hx1, hy2 + 35),
                               font_scale=0.65,
                               bg_color=(80, 40, 0),
                               text_color=C_ACCENT)

                # Highlight raised fingertip circles
                tip_ids = [4, 8, 12, 16, 20]
                for f_idx, tip_id in enumerate(tip_ids):
                    if per_finger[f_idx]:
                        tip = hand_lm[tip_id]
                        cx, cy = int(tip.x * w), int(tip.y * h)
                        cv2.circle(frame, (cx, cy), 12, C_FINGER, -1)
                        cv2.circle(frame, (cx, cy), 12, C_TEXT, 2)

        # ─── TOP HUD BAR ─────────────────────
        banner = frame[0:50, 0:w].copy()
        cv2.rectangle(banner, (0, 0), (w, 50), (15, 15, 15), -1)
        cv2.addWeighted(banner, 0.6, frame[0:50, 0:w], 0.4, 0,
                        frame[0:50, 0:w])

        draw_text(frame, "FACE + HAND ANALYSER",
                  (10, 33), font_scale=0.9, color=C_ACCENT)
        draw_text(frame, f"Total Fingers Up: {total_fingers}",
                  (w - 300, 33), font_scale=0.8, color=(100, 255, 150))
        draw_text(frame, "Press  Q  to quit",
                  (10, h - 12), font_scale=0.5,
                  color=(160, 160, 160), thickness=1, shadow=False)

        cv2.imshow("Face + Hand Analyser", frame)
        key = cv2.waitKey(1) & 0xFF
        if key in (ord("q"), ord("Q"), 27):
            print("[BYE] Exiting...")
            break

    cap.release()
    cv2.destroyAllWindows()
    detector.close()

if __name__ == "__main__":
    main()

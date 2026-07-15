import os
import sys
import time
import urllib.request
import cv2
import mediapipe as mp
from mediapipe.tasks.python.vision import HandLandmarker, HandLandmarkerOptions
from mediapipe.tasks.python.vision.core.vision_task_running_mode import VisionTaskRunningMode as RunningMode
from mediapipe.tasks.python.core.base_options import BaseOptions
import numpy as np
import requests

def draw_centered_text(img, text, rect, color, font_scale=0.5, thickness=2):
    """
    Helper function to draw center-aligned text inside a rectangular region.
    """
    x1, y1, x2, y2 = rect
    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
    text_x = x1 + (x2 - x1 - text_size[0]) // 2
    text_y = y1 + (y2 - y1 + text_size[1]) // 2
    cv2.putText(img, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness, cv2.LINE_AA)

def setup_model(model_path="hand_landmarker.task"):
    """
    Step 1: Automated Setup & Dependencies
    Checks if hand_landmarker.task exists locally. If not, automatically
    downloads it from Google's CDN using requests in chunks for flawless setup.
    """
    if os.path.exists(model_path):
        return True
        
    print("--------------------------------------------------")
    print("Downloading hand_landmarker.task model via requests (approx. 5.6 MB)...")
    url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024 * 1024  # 1 MB block chunks
        downloaded = 0
        
        with open(model_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=block_size):
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"Downloaded: {percent:.1f}% ({downloaded / (1024 * 1024):.2f} MB / {total_size / (1024 * 1024):.2f} MB)")
                else:
                    print(f"Downloaded: {downloaded / (1024 * 1024):.2f} MB")
                    
        print("Download completed successfully!")
        print("--------------------------------------------------")
        return True
    except Exception as e:
        print(f"Error downloading model: {e}")
        if os.path.exists(model_path):
            os.remove(model_path)
        return False

def main():
    # Setup and download model if necessary
    model_path = "hand_landmarker.task"
    if not setup_model(model_path):
        print("Setup failed. Exiting.")
        return

    # Configure the HandLandmarker Options (Modern Tasks API)
    base_options = BaseOptions(model_asset_path=model_path)
    options = HandLandmarkerOptions(
        base_options=base_options,
        running_mode=RunningMode.VIDEO,
        num_hands=1
    )

    # Initialize Webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    # Set standard frame dimensions (640 x 480)
    width, height = 640, 480
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

    # Initialize drawing canvas (black numpy array representing pure zero states)
    canvas = np.zeros((height, width, 3), dtype=np.uint8)

    # Configuration for UI Buttons (x1, y1, x2, y2)
    buttons = [
        {"name": "CLEAR", "rect": (15, 15, 115, 65), "bg_color": (50, 50, 50), "text_color": (255, 255, 255), "draw_color": None},
        {"name": "BLUE", "rect": (140, 15, 240, 65), "bg_color": (255, 0, 0), "text_color": (255, 255, 255), "draw_color": (255, 0, 0)},
        {"name": "GREEN", "rect": (265, 15, 365, 65), "bg_color": (0, 255, 0), "text_color": (0, 0, 0), "draw_color": (0, 255, 0)},
        {"name": "RED", "rect": (390, 15, 490, 65), "bg_color": (0, 0, 255), "text_color": (255, 255, 255), "draw_color": (0, 0, 255)},
        {"name": "YELLOW", "rect": (515, 15, 615, 65), "bg_color": (0, 255, 255), "text_color": (0, 0, 0), "draw_color": (0, 255, 255)},
    ]

    # Core State Variables
    active_color = (0, 0, 255)  # Default drawing color BGR (Red)
    
    # State tracking variables for dynamic "Pen Up" reset
    previous_x = 0
    previous_y = 0

    # Exponential Moving Average (EMA) memory states for coordinates smoothing
    smoothed_x = None
    smoothed_y = None
    smoothing_factor = 0.65  # Alpha (weights recent raw frames vs history)

    print("--------------------------------------------------")
    print("Air Canvas Started Successfully!")
    print("Controls:")
    print(" - Drawing Mode: Keep Only INDEX FINGER UP.")
    print(" - Selection/Menu Mode: Keep BOTH INDEX & MIDDLE FINGERS UP.")
    print(" - Hover/Idle Mode: Any other posture (Resets drawing path).")
    print(" - Press 'q' to quit the application gracefully.")
    print("--------------------------------------------------")

    # Start the hand landmarker detector
    with HandLandmarker.create_from_options(options) as detector:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                print("Failed to grab camera frame.")
                break

            # Mirror effect: flip horizontally so drawing feels highly intuitive
            frame = cv2.flip(frame, 1)

            # Convert BGR frame to mp.Image format for the modern Tasks API
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            
            # Fetch current millisecond timestamp needed by the video tracking mode
            timestamp_ms = int(time.time() * 1000)
            results = detector.detect_for_video(mp_image, timestamp_ms)

            # State parameters
            hand_detected = False
            drawing_mode = False
            selection_mode = False
            raw_finger_tip = None
            brush_thickness = 5

            if results.hand_landmarks:
                landmarks = results.hand_landmarks[0]
                hand_detected = True

                # Parse hand joint coordinates
                # Index Finger Tip (Landmark 8) and Index Finger PIP (Landmark 6)
                ix, iy = int(landmarks[8].x * width), int(landmarks[8].y * height)
                ipx, ipy = int(landmarks[6].x * width), int(landmarks[6].y * height)
                
                # Middle Finger Tip (Landmark 12) and Middle Finger PIP (Landmark 10)
                mx, my = int(landmarks[12].x * width), int(landmarks[12].y * height)
                mpx, mpy = int(landmarks[10].x * width), int(landmarks[10].y * height)

                raw_finger_tip = (ix, iy)

                # Determine finger extensions (tip's y is lower than joint's y when pointing up)
                index_up = iy < ipy
                middle_up = my < mpy

                # Step 3: State Classification & Gestures
                if index_up and middle_up:
                    selection_mode = True
                elif index_up and not middle_up:
                    drawing_mode = True

                # Step 4: Stabilization (EMA) & Dynamic Thickness (Z-depth)
                # 4.1 Apply Exponential Moving Average (EMA) to eliminate landmark micro-jitter:
                # Math: S_t = alpha * X_t + (1 - alpha) * S_{t-1}
                # Where S_t is the stabilized point, X_t is the raw point, and S_{t-1} is historical memory.
                if drawing_mode or selection_mode:
                    if smoothed_x is None or smoothed_y is None:
                        # Initialize filter memory with the first captured coordinates
                        smoothed_x = float(ix)
                        smoothed_y = float(iy)
                    else:
                        # Smooth coordinates using the defined smoothing_factor of 0.65
                        smoothed_x = (smoothing_factor * ix) + ((1 - smoothing_factor) * smoothed_x)
                        smoothed_y = (smoothing_factor * iy) + ((1 - smoothing_factor) * smoothed_y)
                
                # 4.2 Dynamic Thickness via Z-axis (Depth) Interpolation:
                # Extract index tip depth z coordinate (Landmark 8)
                raw_z = landmarks[8].z
                
                # Use numpy.interp to map raw z range [-0.15, 0.05] to dynamic brush thicknesses [25, 2].
                # Closer to camera (-0.15) maps to thick line (25), further (0.05) maps to thin line (2).
                brush_thickness = int(np.interp(raw_z, [-0.15, 0.05], [25, 2]))

            # Step 3 (Cont.): Crucial "Pen Up" Reset logic
            # Whenever the user is NOT actively in Drawing Mode, we must reset previous_x,
            # previous_y, and the EMA coordinate states back to zero/None to prevent long jumping lines
            # connecting independent strokes.
            if not drawing_mode:
                previous_x = 0
                previous_y = 0
                smoothed_x = None
                smoothed_y = None

            # Step 4 (Cont.): Draw Stabilized line on Canvas
            if drawing_mode and raw_finger_tip and (smoothed_x is not None) and (smoothed_y is not None):
                target_x = int(smoothed_x)
                target_y = int(smoothed_y)
                
                # Draw a line from previous point to the current stabilized point
                if previous_x != 0 and previous_y != 0:
                    cv2.line(canvas, (previous_x, previous_y), (target_x, target_y), active_color, brush_thickness)
                
                # Store coordinates for the next sequential loop frame
                previous_x = target_x
                previous_y = target_y

            # Step 5: Perfect Neon Compositing via Bitwise Operations
            # Convert the black background canvas into a binary mask
            gray_canvas = cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)
            # Create a threshold where colored drawings map to white (255) and empty parts to black (0)
            _, thresh = cv2.threshold(gray_canvas, 1, 255, cv2.THRESH_BINARY)
            # Invert threshold mask so empty spaces are white (255) and drawing areas are black (0)
            mask_inv = cv2.bitwise_not(thresh)
            # Black out the drawing region from the original webcam mirror feed
            frame_bg = cv2.bitwise_and(frame, frame, mask=mask_inv)
            # Isolate only the neon lines from the raw canvas drawing array
            canvas_fg = cv2.bitwise_and(canvas, canvas, mask=thresh)
            # Combine the two isolated layers together for a perfect composite frame
            combined = cv2.add(frame_bg, canvas_fg)

            # Step 3 (Cont.): Render User Interface Overlay (frosted glass header)
            # 5.1 Glassmorphism style dark header panel
            header_overlay = combined.copy()
            cv2.rectangle(header_overlay, (0, 0), (width, 80), (15, 15, 15), cv2.FILLED)
            cv2.addWeighted(header_overlay, 0.65, combined, 0.35, 0, combined)

            # 5.2 Draw Menu Buttons and handle Selection logic
            for btn in buttons:
                bx1, by1, bx2, by2 = btn["rect"]
                is_hovered = False

                # Bounding box collision checking in selection mode
                if selection_mode and raw_finger_tip:
                    fx, fy = raw_finger_tip
                    if bx1 <= fx <= bx2 and by1 <= fy <= by2:
                        is_hovered = True
                        # Perform selection action
                        if btn["name"] == "CLEAR":
                            canvas = np.zeros((height, width, 3), dtype=np.uint8)
                        else:
                            active_color = btn["draw_color"]

                # Hover highlight & border thickness styling
                border_color = (255, 255, 255) if (btn["draw_color"] == active_color or is_hovered) else (80, 80, 80)
                thickness = 3 if (btn["draw_color"] == active_color or is_hovered) else 1

                # Draw filled rectangular background box
                cv2.rectangle(combined, (bx1, by1), (bx2, by2), btn["bg_color"], cv2.FILLED)
                # Draw premium glowing outer highlight border
                cv2.rectangle(combined, (bx1, by1), (bx2, by2), border_color, thickness)
                # Centered alignment text rendering
                draw_centered_text(combined, btn["name"], btn["rect"], btn["text_color"])

            # 5.3 Draw Hand Visual Pointer Aids
            if hand_detected and (smoothed_x is not None) and (smoothed_y is not None):
                target_point = (int(smoothed_x), int(smoothed_y))
                if selection_mode:
                    # Target selection pointer with secondary outer circle
                    cv2.circle(combined, target_point, 12, (255, 255, 255), 2)
                    cv2.circle(combined, target_point, 4, active_color, cv2.FILLED)
                elif drawing_mode:
                    # Dynamic brush preview representing exact z-axis thickness
                    cv2.circle(combined, target_point, brush_thickness + 1, active_color, cv2.FILLED)
                    cv2.circle(combined, target_point, brush_thickness + 3, (255, 255, 255), 1)

            # Render active status parameters in bottom-left corner
            mode_string = "SELECT" if selection_mode else "DRAW" if drawing_mode else "HOVER"
            cv2.putText(combined, f"MODE: {mode_string}",
                        (15, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
            if drawing_mode:
                cv2.putText(combined, f"BRUSH: {brush_thickness}px",
                            (width - 150, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)

            # Step 5 (Cont.): Render full composite frame
            cv2.imshow("Air Canvas - Antigravity", combined)

            # Exit key listeners: close gracefully when 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    # Release webcam and window frame resources
    cap.release()
    cv2.destroyAllWindows()
    print("Application closed successfully.")

if __name__ == "__main__":
    main()

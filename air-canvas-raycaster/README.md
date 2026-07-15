# 🎨 Air Canvas & Retro 3D Raycasting Engine

A hybrid computer vision and interactive gaming engine combining a gesture-controlled drawing interface ("Air Canvas") with a classic 3D raycasting maze renderer using the DDA (Digital Differential Analysis) collision algorithm.

---

## 🏗️ Architecture & Engines

The project is structured into two core systems:

```
┌─────────────────────────────────────────────────────────────────┐
│                    GESTURE TRACKER (Python)                     │
│                                                                 │
│  📹 Camera Feed ➔ MediaPipe HandLandmarker ➔ Screen Coordinates │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Inter-process Socket (Optional)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3D RAYCASTER ENGINE (JS)                     │
│                                                                 │
│  ⌨️ WASD/Coordinates ➔ DDA Wall Casting ➔ HTML5 Canvas Renderer │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Air Canvas Gesture Tracker (Python)
* **MediaPipe Hand Landmark Tracking**: Detects hand gestures via a live webcam feed.
* **Drawing Mechanics**:
  * **Drawing Mode**: If the Index finger is raised and the Middle finger is down, the coordinates are tracked to paint on a virtual canvas.
  * **Selection Mode**: If both Index and Middle fingers are raised, the user can select colors/tools from the top HUD.
  * **Clear Canvas**: If all fingers are closed (fist gesture), the canvas is cleared.
* **Canvas Mapping**: Calibrates and maps the 2D webcam coordinates to match the HTML5 canvas screen aspect ratios.

### 2. Retro 3D Raycasting Engine (HTML5 Canvas)
A software renderer inspired by Wolfenstein 3D:
* **Digital Differential Analysis (DDA)**: A fast grid traversal algorithm used in 2D grids to find intersections with walls. Instead of checking every pixel, it jumps between grid cell boundaries, reducing computational overhead and enabling high-performance rendering in JavaScript.
* **Raycasting math**:
  * For each vertical strip on the screen (e.g. 320 columns), a ray is cast from the player's position through the viewing plane.
  * Measures distance to wall intersections, computing projection heights:
    \[\text{Wall Height} = \frac{\text{Screen Height}}{\text{Corrected Distance}}\]
  * Corrects the fish-eye distortion effect by multiplying the distance by the cosine of the ray's angle relative to the player's direction vector.
* **Collision Detection**: Simple bounding box checks prevent players from passing through solid grid walls.

---

## 📦 Project Layout

```
air-canvas-raycaster/
├── tracker/                    # Air Canvas tracker (Python)
│   ├── main.py                 # Hand landmarks parser & paint window
│   ├── hand_landmarker.task    # Local MediaPipe binary weights
│   └── requirements.txt        # OpenCV, MediaPipe dependencies
│
└── raycaster-engine/           # Retro 3D Maze (HTML5 Canvas)
    ├── index.html              # Main page and viewport layout
    ├── style.css               # Core layout and styling
    └── game.js                 # DDA Raycaster, input handlers, rendering loops
```

---

## 🚀 Setup & Execution

### Playing the 3D Raycaster Engine
Open `raycaster-engine/index.html` directly in any web browser.
Use the **WASD** or **Arrow keys** to navigate the 3D grid and experience retro rendering in real time.

### Launching the Air Canvas Paint Tool
1. Navigate to the tracker folder and install python requirements:
   ```bash
   cd tracker
   pip install -r requirements.txt
   ```
2. Run the tracker application:
   ```bash
   python main.py
   ```
   *Raise your index finger to begin drawing on the virtual canvas. Raise both index and middle fingers to trigger selection mode.*

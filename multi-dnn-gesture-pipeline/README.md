# 👁️ Multi-DNN Face & Gesture Pipeline

A real-time, multi-threaded computer vision pipeline utilizing high-performance ONNX Runtime wrappers and Google MediaPipe tasks to analyze facial attributes and hand gestures concurrently.

---

## 🏗️ Architecture & Processing Pipeline

The pipeline is engineered to bypass Python's Global Interpreter Lock (GIL) and GPU/CPU resource locks by offloading execution to separate system threads:

```
                  ┌────────────────────────────────┐
                  │      Opencv Video Stream       │
                  └───────────────┬────────────────┘
                                  │ Frame Ingestion (60 FPS)
                                  ├──────────────────────────────┐
                                  ▼                              ▼
                       ┌────────────────────┐          ┌────────────────────┐
                       │  MediaPipe Thread  │          │ ONNX Face Worker   │
                       │   Hand Landmarks   │          │ (Async Queue)      │
                       └──────────┬─────────┘          └─────────┬──────────┘
                                  │                              │ (Every N frames)
                                  │                              │ Age, Gender, Emotion
                                  └──────────────┬───────────────┘
                                                 ▼
                                     ┌──────────────────────┐
                                     │  HUD Overlay Thread  │
                                     │   Low-latency Canvas │
                                     └──────────────────────┘
```

### 1. Main Ingestion Loop
* Captures high-definition frames from the camera device.
* Passes frames to the processing workers.

### 2. MediaPipe Hand Tracking (Synchronous HUD)
* Runs the modern Google MediaPipe HandLandmarker Tasks API.
* Computes coordinates for 21 hand joints on every frame to ensure smooth gesture overlays.
* Calculates finger status (e.g. raised or bent) dynamically via finger tip vs MCP joint relative distances.

### 3. Asynchronous ONNX Attribute Processing (Worker Thread)
* Runs heavy face classification tasks (Emotion FERPlus ONNX model) on a dedicated background thread.
* Instead of locking the camera loop, facial detection bounding boxes are extracted and sent to a buffer queue.
* Attribute analysis runs once every `N` frames (default `10`), updating a shared state lock. The display thread interpolates box locations to maintain fluid visual feedback.

### 4. C++ Inference Engine (High-Performance Layer)
For environments requiring maximum performance, a C++ directory layout is provided:
* Utilizes the **ONNX Runtime C++ API** directly.
* Configures thread pools (`IntraOpNumThreads`) and graph optimizations (`ORT_ENABLE_ALL`).
* Features a ring-buffer frame queue that drops old inputs when worker loops are saturated, ensuring zero lag.

---

## 📦 Project Layout

```
multi-dnn-gesture-pipeline/
├── main.py                     # Primary Python pipeline entry point
├── test_mp.py                  # Short MediaPipe sanity test script
├── requirements.txt            # Python dependencies (no TensorFlow required)
│
├── models/                     # Downloader folder for ONNX/Task weights
│   └── download_models.py      # Autodownload helper script
│
└── cpp_inference/              # High-Performance C++ Inference Engine
    ├── CMakeLists.txt          # Native compiler configurations
    ├── include/
    │   └── OnnxWrapper.h       # C++ session header declarations
    └── src/
        ├── OnnxWrapper.cpp     # ONNX Runtime session implementation
        └── main.cpp            # Thread pool driver and benchmark wrapper
```

---

## 🚀 Setup & Execution

### Python Pipeline
1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   python main.py
   ```
   *Note: Models will download automatically to the `models/` directory on first launch.*

### C++ Native Inference Engine
1. Install ONNX Runtime dev package.
2. Build with CMake:
   ```bash
   cd cpp_inference
   mkdir build && cd build
   cmake ..
   cmake --build . --config Release
   ```
3. Run the binary:
   ```bash
   ./onnx_inference_engine
   ```

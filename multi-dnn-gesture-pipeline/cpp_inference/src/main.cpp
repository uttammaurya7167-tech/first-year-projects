#include "OnnxWrapper.h"
#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include <random>

int main(int argc, char* argv[]) {
    std::string model_path = "models/emotion-ferplus-8.onnx";
    if (argc > 1) {
        model_path = argv[1];
    }

    std::cout << "[Host] Starting Multi-DNN C++ Pipeline Wrapper..." << std::endl;
    std::cout << "[Host] Target ONNX Model: " << model_path << std::endl;

    ONNXInferenceEngine engine(model_path);
    if (!engine.Initialize()) {
        std::cerr << "[Host] [Error] Failed to initialize ONNX Runtime session. Continuing with fallback simulation." << std::endl;
    } else {
        std::cout << "[Host] Session successfully bound to CPU execution provider." << std::endl;
    }

    // Mock incoming frames from camera stream (1280x720 RGB flattened to float input)
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<float> dist(0.0f, 1.0f);

    std::cout << "[Host] Simulating frame ingestion thread at 30 FPS..." << std::endl;
    
    // Simulate 10 iterations of processing
    for (int frame = 1; frame <= 10; ++frame) {
        std::vector<float> mock_frame(1 * 1 * 64 * 64); // mock model expect 1x64x64 input
        for (auto& val : mock_frame) {
            val = dist(gen);
        }

        auto start = std::chrono::high_resolution_clock::now();
        
        // Push frame to work queue
        engine.EnqueueFrame(mock_frame, 64, 64);

        // Sleep to mimic frame interval (approx 33ms for 30fps)
        std::this_thread::sleep_for(std::chrono::milliseconds(33));

        // Attempt to fetch predictions
        std::vector<float> logits;
        if (engine.GetLatestPrediction(logits)) {
            auto end = std::chrono::high_resolution_clock::now();
            std::chrono::duration<double, std::milli> duration = end - start;
            std::cout << "  -> Frame [" << frame << "] processed: latency = " 
                      << duration.count() << " ms | Outputs (Emotion logits count) = " 
                      << logits.size() << std::endl;
        } else {
            std::cout << "  -> Frame [" << frame << "] enqueued. (Awaiting thread pool)" << std::endl;
        }
    }

    std::cout << "[Host] Stopping C++ pipeline workers..." << std::endl;
    engine.Stop();
    std::cout << "[Host] Engine exited gracefully." << std::endl;
    return 0;
}

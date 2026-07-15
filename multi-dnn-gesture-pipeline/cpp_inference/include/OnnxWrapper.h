#pragma once

#include <string>
#include <vector>
#include <memory>
#include <mutex>
#include <queue>
#include <thread>
#include <condition_variable>
#include <onnxruntime_cxx_api.h>

class ONNXInferenceEngine {
public:
    ONNXInferenceEngine(const std::string& model_path);
    ~ONNXInferenceEngine();

    // Initialize session and allocators
    bool Initialize();

    // Enqueue an image frame for asynchronous prediction
    void EnqueueFrame(const std::vector<float>& input_data, int width, int height);

    // Get the latest result from the pipeline (blocking or non-blocking)
    bool GetLatestPrediction(std::vector<float>& output_logits);

    // Stop execution thread
    void Stop();

private:
    void InferenceWorkerLoop();
    void RunInference(const std::vector<float>& input_data);

    std::string model_path_;
    
    // ONNX Runtime resources
    Ort::Env env_;
    std::unique_ptr<Ort::Session> session_;
    Ort::MemoryInfo memory_info_;

    // Model shapes & metadata
    std::vector<int64_t> input_node_dims_;
    std::vector<int64_t> output_node_dims_;
    std::vector<const char*> input_node_names_;
    std::vector<const char*> output_node_names_;

    // Multi-threaded synchronization
    std::thread worker_thread_;
    std::mutex queue_mutex_;
    std::condition_variable cv_;
    bool is_running_;

    std::queue<std::vector<float>> frame_queue_;
    std::queue<std::vector<float>> result_queue_;
    std::mutex result_mutex_;
};

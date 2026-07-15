#include "OnnxWrapper.h"
#include <iostream>
#include <numeric>
#include <algorithm>
#include <stdexcept>

ONNXInferenceEngine::ONNXInferenceEngine(const std::string& model_path)
    : model_path_(model_path),
      env_(ORT_LOGGING_LEVEL_WARNING, "ONNX_Pipeline"),
      memory_info_(Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault)),
      is_running_(false) {}

ONNXInferenceEngine::~ONNXInferenceEngine() {
    Stop();
}

bool ONNXInferenceEngine::Initialize() {
    try {
        Ort::SessionOptions session_options;
        session_options.SetIntraOpNumThreads(2);
        session_options.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_ALL);

        // Load ONNX Model
#ifdef _WIN32
        std::wstring w_model_path(model_path_.begin(), model_path_.end());
        session_ = std::make_unique<Ort::Session>(env_, w_model_path.c_str(), session_options);
#else
        session_ = std::make_unique<Ort::Session>(env_, model_path_.c_str(), session_options);
#endif

        Ort::AllocatorWithDefaultOptions allocator;

        // Retrieve input metadata
        size_t num_input_nodes = session_->GetInputCount();
        if (num_input_nodes > 0) {
            auto input_name_allocated = session_->GetInputNameAllocated(0, allocator);
            // In real production, we'd manage lifetime of node names, we clone them for demonstration
            input_node_names_.push_back(strdup(input_name_allocated.get()));
            
            Ort::TypeInfo type_info = session_->GetInputTypeInfo(0);
            auto tensor_info = type_info.GetTensorTypeAndShapeInfo();
            input_node_dims_ = tensor_info.GetShape();
        }

        // Retrieve output metadata
        size_t num_output_nodes = session_->GetOutputCount();
        if (num_output_nodes > 0) {
            auto output_name_allocated = session_->GetOutputNameAllocated(0, allocator);
            output_node_names_.push_back(strdup(output_name_allocated.get()));

            Ort::TypeInfo type_info = session_->GetOutputTypeInfo(0);
            auto tensor_info = type_info.GetTensorTypeAndShapeInfo();
            output_node_dims_ = tensor_info.GetShape();
        }

        is_running_ = true;
        worker_thread_ = std::thread(&ONNXInferenceEngine::InferenceWorkerLoop, this);
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Initialization failed: " << e.what() << std::endl;
        return false;
    }
}

void ONNXInferenceEngine::EnqueueFrame(const std::vector<float>& input_data, int width, int height) {
    {
        std::lock_guard<std::mutex> lock(queue_mutex_);
        if (frame_queue_.size() > 5) {
            frame_queue_.pop(); // Drop oldest frame to maintain real-time low latency (HUD updates)
        }
        frame_queue_.push(input_data);
    }
    cv_.notify_one();
}

bool ONNXInferenceEngine::GetLatestPrediction(std::vector<float>& output_logits) {
    std::lock_guard<std::mutex> lock(result_mutex_);
    if (result_queue_.empty()) {
        return false;
    }
    output_logits = std::move(result_queue_.front());
    result_queue_.pop();
    return true;
}

void ONNXInferenceEngine::Stop() {
    {
        std::lock_guard<std::mutex> lock(queue_mutex_);
        if (!is_running_) return;
        is_running_ = false;
    }
    cv_.notify_all();
    if (worker_thread_.joinable()) {
        worker_thread_.join();
    }

    for (auto name : input_node_names_) free((void*)name);
    for (auto name : output_node_names_) free((void*)name);
    input_node_names_.clear();
    output_node_names_.clear();
}

void ONNXInferenceEngine::InferenceWorkerLoop() {
    while (true) {
        std::vector<float> input_data;
        {
            std::unique_lock<std::mutex> lock(queue_mutex_);
            cv_.wait(lock, [this]() { return !is_running_ || !frame_queue_.empty(); });

            if (!is_running_ && frame_queue_.empty()) {
                break;
            }

            input_data = std::move(frame_queue_.front());
            frame_queue_.pop();
        }

        RunInference(input_data);
    }
}

void ONNXInferenceEngine::RunInference(const std::vector<float>& input_data) {
    try {
        // Create input tensor
        size_t input_tensor_size = std::accumulate(input_node_dims_.begin(), input_node_dims_.end(), 1, std::multiplies<int64_t>());
        std::vector<float> tensor_data = input_data;
        if (tensor_data.size() < input_tensor_size) {
            tensor_data.resize(input_tensor_size, 0.0f);
        }

        Ort::Value input_tensor = Ort::Value::CreateTensor<float>(
            memory_info_, tensor_data.data(), tensor_data.size(), input_node_dims_.data(), input_node_dims_.size()
        );

        // Run inference session
        auto output_tensors = session_->Run(
            Ort::RunOptions{nullptr},
            input_node_names_.data(), &input_tensor, 1,
            output_node_names_.data(), 1
        );

        float* float_array = output_tensors.front().GetTensorMutableData<float>();
        size_t output_tensor_size = std::accumulate(output_node_dims_.begin(), output_node_dims_.end(), 1, std::multiplies<int64_t>());

        std::vector<float> prediction_logits(float_array, float_array + output_tensor_size);

        {
            std::lock_guard<std::mutex> lock(result_mutex_);
            if (result_queue_.size() > 5) {
                result_queue_.pop();
            }
            result_queue_.push(prediction_logits);
        }
    } catch (const std::exception& e) {
        std::cerr << "Inference execution error: " << e.what() << std::endl;
    }
}

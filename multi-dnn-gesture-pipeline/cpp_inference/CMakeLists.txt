cmake_minimum_required(VERSION 3.16)
project(OnnxInferenceEngine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find ONNX Runtime (requires ONNXRUNTIME_ROOT environment variable or installed system package)
find_path(ONNXRUNTIME_INCLUDE_DIR NAMES onnxruntime_cxx_api.h)
find_library(ONNXRUNTIME_LIBRARY NAMES onnxruntime)

include_directories(${ONNXRUNTIME_INCLUDE_DIR} include)

# Source files
set(SOURCES
    src/OnnxWrapper.cpp
    src/main.cpp
)

# Header files
set(HEADERS
    include/OnnxWrapper.h
)

# Executable target
add_executable(onnx_inference_engine ${SOURCES} ${HEADERS})

if (ONNXRUNTIME_LIBRARY)
    target_link_libraries(onnx_inference_engine PRIVATE ${ONNXRUNTIME_LIBRARY} Threads::Threads)
else()
    message(WARNING "ONNX Runtime library not found. Please set ONNXRUNTIME_ROOT or install it to link successfully.")
    target_link_libraries(onnx_inference_engine PRIVATE Threads::Threads)
endif()

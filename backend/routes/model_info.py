from fastapi import APIRouter

router = APIRouter()


@router.get("/model-info")
def model_info():
    from ml.config import (
        CLASSES,
        IMAGE_SIZE,
        CONFIDENCE_THRESHOLDS,
        MODEL_PATH,
    )
    from pathlib import Path

    return {
        "architecture": "MobileNetV2 (transfer learning)",
        "task": "Binary Image Classification",
        "classes": CLASSES,
        "input_size": f"{IMAGE_SIZE[0]} x {IMAGE_SIZE[1]} x 3",
        "transfer_learning": "ImageNet",
        "framework": "TensorFlow / Keras",
        "model_loaded": Path(MODEL_PATH).exists(),
        "confidence_thresholds": CONFIDENCE_THRESHOLDS,
    }
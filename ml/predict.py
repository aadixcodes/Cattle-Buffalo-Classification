"""
Standalone prediction utility — used by the FastAPI backend and runnable
from the CLI:

    python ml/predict.py path/to/image.jpg
"""
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image

from . import config as C
from .model import load_trained_model
from .preprocessing import preprocess_for_inference
from .config import confidence_level


_model = None


def get_model():
    global _model
    if _model is None:
        _model = load_trained_model()
    return _model


def predict_image(image: np.ndarray) -> dict:
    """Run inference on an RGB numpy image (0-255) and return a result dict."""
    processed = preprocess_for_inference(image)
    batch = np.expand_dims(processed, axis=0)
    model = get_model()
    prob_buffalo = float(model.predict(batch, verbose=0).flatten()[0])

    buffalo_pct = prob_buffalo * 100.0
    cattle_pct = (1 - prob_buffalo) * 100.0
    prediction = C.INDEX_TO_CLASS[1] if prob_buffalo >= 0.5 else C.INDEX_TO_CLASS[0]
    confidence = max(buffalo_pct, cattle_pct)

    return {
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "probabilities": {
            "cattle": round(cattle_pct, 2),
            "buffalo": round(buffalo_pct, 2),
        },
        "confidence_level": confidence_level(confidence),
    }


def predict_file(path: str | Path) -> dict:
    img = Image.open(path).convert("RGB")
    arr = np.array(img)
    return predict_image(arr)


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) != 2:
        raise SystemExit("Usage: python ml/predict.py <image_path>")
    result = predict_file(sys.argv[1])
    print(json.dumps(result, indent=2))
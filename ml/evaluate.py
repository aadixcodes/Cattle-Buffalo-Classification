"""
Evaluate the trained model on the test set and write metrics + confusion
matrix to public/model/metrics.json (consumed by the frontend performance
page).

Usage:
    python ml/evaluate.py
"""
import json
from datetime import datetime
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

from . import config as C
from .model import load_trained_model


def main():
    if not Path(C.MODEL_PATH).exists():
        raise SystemExit(
            f"Trained model not found at {C.MODEL_PATH}. Run `python ml/train.py` first."
        )
    if not C.TEST_DIR.exists():
        raise SystemExit(
            f"Test dataset not found at {C.TEST_DIR}. Add test images and re-run."
        )

    print("Loading test dataset...")
    test_ds = tf.keras.utils.image_dataset_from_directory(
        str(C.TEST_DIR),
        image_size=C.IMAGE_SIZE,
        batch_size=C.BATCH_SIZE,
        label_mode="binary",
        shuffle=False,
    )
    class_names = test_ds.class_names
    print("Classes:", class_names)

    model = load_trained_model()

    y_true = []
    y_pred = []
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0).flatten()
        y_true.extend(labels.numpy().flatten().astype(int).tolist())
        y_pred.extend((preds > 0.5).astype(int).tolist())

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average="binary", zero_division=0)
    recall = recall_score(y_true, y_pred, average="binary", zero_division=0)
    f1 = f1_score(y_true, y_pred, average="binary", zero_division=0)
    cm = confusion_matrix(y_true, y_pred).tolist()

    metrics = {
        "hasMetrics": True,
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "confusionMatrix": cm,
        "trainedAt": datetime.now().isoformat(),
    }

    Path(C.METRICS_PATH).parent.mkdir(parents=True, exist_ok=True)
    with open(C.METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("Evaluation complete.")
    print(f"  Accuracy:  {accuracy*100:.2f}%")
    print(f"  Precision: {precision*100:.2f}%")
    print(f"  Recall:    {recall*100:.2f}%")
    print(f"  F1 Score:  {f1*100:.2f}%")
    print(f"  Confusion matrix (rows=actual, cols=predicted): {cm}")
    print(f"Written to {C.METRICS_PATH}")


if __name__ == "__main__":
    main()
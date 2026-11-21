"""
Central configuration for the cattle & buffalo classification ML pipeline.

All paths, hyperparameters and constants used by train.py / evaluate.py /
predict.py live here so they can be tuned in one place.
"""
from pathlib import Path

# Project root (ml/ -> project root)
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Dataset location. Organise as:
#   ml/dataset/{train,validation,test}/{cattle,buffalo}/*.jpg
DATASET_DIR = PROJECT_ROOT / "ml" / "dataset"
TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "validation"
TEST_DIR = DATASET_DIR / "test"

# Class index mapping — MUST match the frontend (cattle=0, buffalo=1)
CLASSES = ["Cattle", "Buffalo"]
CLASS_TO_INDEX = {name: i for i, name in enumerate(CLASSES)}
INDEX_TO_CLASS = {i: name for i, name in enumerate(CLASSES)}

# Image / model
IMAGE_SIZE = (224, 224)          # MobileNetV2 default input
IMAGE_CHANNELS = 3
INPUT_SHAPE = (*IMAGE_SIZE, IMAGE_CHANNELS)

# Training hyperparameters
BATCH_SIZE = 32
INITIAL_EPOCHS = 15           # transfer-learning (frozen base)
FINETUNE_EPOCHS = 10          # fine-tuning (unfrozen top layers)
INITIAL_LR = 1e-3
FINETUNE_LR = 1e-5
EARLY_STOP_PATIENCE = 5
REDUCE_LR_PATIENCE = 3
DROPOUT_RATE = 0.3

# Data augmentation (kept moderate to preserve animal features)
AUGMENTATION = dict(
    horizontal_flip=True,
    rotation_range=15,
    zoom_range=0.15,
    contrast_range=0.15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    fill_mode="nearest",
)

# Saved artefacts
SAVED_MODELS_DIR = PROJECT_ROOT / "ml" / "saved_models"
MODEL_PATH = SAVED_MODELS_DIR / "cattle_buffalo_model.keras"
METRICS_PATH = PROJECT_ROOT / "public" / "model" / "metrics.json"
TRAINING_HISTORY_PATH = PROJECT_ROOT / "public" / "model" / "training_history.json"
TFJS_MODEL_DIR = SAVED_MODELS_DIR / "tfjs_model"   # for browser inference

# Inference / API
CONFIDENCE_THRESHOLDS = {"high": 90.0, "moderate": 70.0}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
ACCEPTED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def confidence_level(confidence: float) -> str:
    if confidence >= CONFIDENCE_THRESHOLDS["high"]:
        return "High"
    if confidence >= CONFIDENCE_THRESHOLDS["moderate"]:
        return "Moderate"
    return "Low"
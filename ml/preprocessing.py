"""
Image preprocessing for both training (augmentation) and inference.

Training pipeline uses tf.keras preprocessing layers for augmentation so the
graph can run on GPU and the exact same normalization is reused at inference.
"""
import numpy as np
import tensorflow as tf

from .config import IMAGE_SIZE, INPUT_SHAPE, AUGMENTATION, DROPOUT_RATE


def build_augmentation_layer() -> tf.keras.Sequential:
    """Keras preprocessing layers for training-time augmentation."""
    layers = [
        tf.keras.layers.RandomFlip(AUGMENTATION["horizontal_flip"] and "horizontal" or None),
        tf.keras.layers.RandomRotation(AUGMENTATION["rotation_range"] / 360.0),
        tf.keras.layers.RandomZoom(AUGMENTATION["zoom_range"]),
        tf.keras.layers.RandomContrast(AUGMENTATION["contrast_range"]),
    ]
    if AUGMENTATION.get("width_shift_range") or AUGMENTATION.get("height_shift_range"):
        layers.append(
            tf.keras.layers.RandomTranslation(
                height_factor=AUGMENTATION.get("height_shift_range", 0.0),
                width_factor=AUGMENTATION.get("width_shift_range", 0.0),
                fill_mode=AUGMENTATION.get("fill_mode", "nearest"),
            )
        )
    return tf.keras.Sequential(layers, name="augmentation")


def load_image_dataset(directory: str, subset: str = "training") -> tf.data.Dataset:
    """Load an image-directory dataset (cattle/ buffalo/ subfolders)."""
    return tf.keras.utils.image_dataset_from_directory(
        directory,
        labels="inferred",
        label_mode="binary",
        class_names=None,
        color_mode="rgb",
        batch_size=32,
        image_size=IMAGE_SIZE,
        shuffle=(subset == "training"),
        seed=42,
        validation_split=0.0,
        subset=None,
    )


def preprocess_for_inference(image: np.ndarray) -> np.ndarray:
    """
    Preprocess a single RGB image array (0-255) for MobileNetV2 inference.
    Resize to 224x224 and apply MobileNet normalization (mean=[-1,1]).
    """
    if image is None or image.size == 0:
        raise ValueError("Empty image received for preprocessing.")
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError(f"Expected RGB image, got shape {image.shape}")

    img = tf.image.resize(image, IMAGE_SIZE)
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    return img.numpy()


__all__ = [
    "build_augmentation_layer",
    "load_image_dataset",
    "preprocess_for_inference",
    "IMAGE_SIZE",
    "INPUT_SHAPE",
    "DROPOUT_RATE",
]
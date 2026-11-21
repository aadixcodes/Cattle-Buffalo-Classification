"""
Model architecture: MobileNetV2 transfer learning with a binary classification
head.

    MobileNetV2 (ImageNet, frozen)
        -> Global Average Pooling
        -> Dropout
        -> Dense (sigmoid) -> Cattle / Buffalo
"""
from pathlib import Path

import tensorflow as tf

from .config import INPUT_SHAPE, DROPOUT_RATE, INITIAL_LR, MODEL_PATH


def build_model(fine_tune_at: int | None = None) -> tf.keras.Model:
    """
    Build the classification model.

    :param fine_tune_at: if provided, unfreeze the base model from this layer
        index onwards and train at a low learning rate. If None, the base
        model is fully frozen (initial transfer-learning phase).
    """
    base = tf.keras.applications.MobileNetV2(
        input_shape=INPUT_SHAPE,
        include_top=False,
        weights="imagenet",
    )

    if fine_tune_at is None:
        base.trainable = False
    else:
        base.trainable = True
        for layer in base.layers[:fine_tune_at]:
            layer.trainable = False

    inputs = tf.keras.Input(shape=INPUT_SHAPE)
    x = tf.keras.layers.Rescaling(1.0 / 127.5, offset=-1.0)(inputs)
    # Augmentation belongs only in the training model; here we keep the base
    # architecture pure and add augmentation as a separate input pipeline.
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(DROPOUT_RATE)(x)
    outputs = tf.keras.layers.Dense(1, activation="sigmoid", name="cattle_buffalo")(x)

    model = tf.keras.Model(inputs, outputs, name="cattle_buffalo_mobilenetv2")

    lr = INITIAL_LR if fine_tune_at is None else 1e-5
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    return model


def load_trained_model(path: Path = MODEL_PATH) -> tf.keras.Model:
    if not Path(path).exists():
        raise FileNotFoundError(
            f"Trained model not found at {path}. Run `python ml/train.py` first."
        )
    return tf.keras.models.load_model(path)


__all__ = ["build_model", "load_trained_model"]
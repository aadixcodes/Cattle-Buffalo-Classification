"""
Run the full training pipeline: initial transfer learning then optional
fine-tuning, with early stopping, model checkpointing, and LR reduction.

Usage:
    python ml/train.py

Expects a dataset at ml/dataset/{train,validation}/(cattle|buffalo)/.
Outputs:
    ml/saved_models/cattle_buffalo_model.keras
    public/model/training_history.json   (consumed by the frontend)
"""
import json
from pathlib import Path

import tensorflow as tf

from . import config as C
from .model import build_model
from .preprocessing import build_augmentation_layer


def main():
    if not C.TRAIN_DIR.exists() or not C.VAL_DIR.exists():
        raise SystemExit(
            "Dataset not found. Place images under "
            "ml/dataset/{train,validation}/(cattle|buffalo)/ and re-run."
        )

    C.SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    Path(C.TRAINING_HISTORY_PATH).parent.mkdir(parents=True, exist_ok=True)

    print("Loading datasets...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        str(C.TRAIN_DIR),
        image_size=C.IMAGE_SIZE,
        batch_size=C.BATCH_SIZE,
        label_mode="binary",
        shuffle=True,
        seed=42,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        str(C.VAL_DIR),
        image_size=C.IMAGE_SIZE,
        batch_size=C.BATCH_SIZE,
        label_mode="binary",
        shuffle=False,
    )

    class_names = train_ds.class_names
    print("Classes detected:", class_names)
    assert sorted(class_names) == [c.lower() for c in C.CLASSES], (
        f"Expected subfolders cattle/ and buffalo/, got {class_names}"
    )

    augmentation = build_augmentation_layer()

    def augment_fn(image, label):
        return augmentation(image, training=True), label

    train_ds = train_ds.map(augment_fn, num_parallel_calls=tf.data.AUTOTUNE)
    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

    print("Building model (initial transfer learning, base frozen)...")
    model = build_model(fine_tune_at=None)
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            patience=C.EARLY_STOP_PATIENCE, restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(patience=C.REDUCE_LR_PATIENCE),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(C.MODEL_PATH), save_best_only=True, verbose=1
        ),
    ]

    print("Training classifier head...")
    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=C.INITIAL_EPOCHS,
        callbacks=callbacks,
    )

    print("Fine-tuning top layers of MobileNetV2...")
    model = build_model(fine_tune_at=len(model.layers[0].layers) - 40)
    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=C.FINETUNE_EPOCHS,
        callbacks=callbacks,
    )

    # Save final model + history for the frontend
    model.save(C.MODEL_PATH)
    print(f"Saved model to {C.MODEL_PATH}")

    history = {
        "acc": history1.history["accuracy"] + history2.history["accuracy"],
        "val_acc": history1.history["val_accuracy"] + history2.history["val_accuracy"],
        "loss": history1.history["loss"] + history2.history["loss"],
        "val_loss": history1.history["val_loss"] + history2.history["val_loss"],
    }
    with open(C.TRAINING_HISTORY_PATH, "w") as f:
        json.dump(history, f, indent=2)
    print(f"Saved training history to {C.TRAINING_HISTORY_PATH}")

    print("Done. Run `python ml/evaluate.py` to compute metrics.")


if __name__ == "__main__":
    main()
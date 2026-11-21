from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    """Return backend + model status. Never raises."""
    try:
        from ml.predict import get_model  # type: ignore
        from ml.config import MODEL_PATH
        from pathlib import Path

        model_loaded = Path(MODEL_PATH).exists()
        if model_loaded:
            get_model()  # eager load
    except Exception:
        model_loaded = False

    return {"status": "healthy", "model_loaded": model_loaded}
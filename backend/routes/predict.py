from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()

ALLOWED = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Run real ML inference on an uploaded animal image."""
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=415, detail="Unsupported file. Please upload a JPG, PNG, or WebP image.")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="Image size exceeds the maximum allowed size (10 MB).")
    if not data:
        raise HTTPException(status_code=400, detail="Empty file received.")

    try:
        import numpy as np
        from PIL import Image
        import io

        img = Image.open(io.BytesIO(data)).convert("RGB")
        arr = np.array(img)
    except Exception:
        raise HTTPException(status_code=422, detail="Corrupt or unreadable image.")

    try:
        from ml.predict import predict_image
        result = predict_image(arr)
        result["is_demo"] = False
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model not trained yet. The trained ML model is not currently connected.")
    except Exception:
        raise HTTPException(status_code=500, detail="Prediction failed. Please try a different image.")
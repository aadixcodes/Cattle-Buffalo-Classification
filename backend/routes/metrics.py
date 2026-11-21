import json
from pathlib import Path

from fastapi import APIRouter

from ml.config import METRICS_PATH

router = APIRouter()


@router.get("/metrics")
def metrics():
    """Return real evaluation metrics. Honest about untrained state."""
    p = Path(METRICS_PATH)
    if not p.exists():
        return {
            "hasMetrics": False,
            "accuracy": 0,
            "precision": 0,
            "recall": 0,
            "f1": 0,
            "confusionMatrix": [[0, 0], [0, 0]],
            "trainedAt": None,
        }
    with open(p) as f:
        return json.load(f)
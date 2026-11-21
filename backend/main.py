"""FastAPI backend for cattle & buffalo classification."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import predict, model_info, metrics, history, health

app = FastAPI(
    title="Cattle & Buffalo Classification API",
    version="1.0.0",
    description="Real ML inference for cattle/buffalo image classification.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Client-Info", "Apikey"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(predict.router, prefix="/api", tags=["predict"])
app.include_router(model_info.router, prefix="/api", tags=["model-info"])
app.include_router(metrics.router, prefix="/api", tags=["metrics"])
app.include_router(history.router, prefix="/api", tags=["history"])


@app.get("/")
def root():
    return {"name": "Cattle & Buffalo Classification API", "docs": "/docs"}
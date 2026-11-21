# Project memory

## Product intent & audience

- In-browser image classification system that runs ML inference client-side and displays predictions with confidence scores, per-class probabilities, confidence levels, dashboard, history, and performance metrics.
- Likely audience: developers/users evaluating ML predictions; educational/demo-oriented product showcasing browser-based inference.

## Brand personality & voice

- Production-grade, polished, not generic. Communication is technical but accessible.

## Visual design & UX direction

- Multi-page app with an About page rendering tech stack, ML architecture table, workflow diagram, API endpoints table, and integrity commitments in a clean formatted layout.
- Lucide React icons used throughout (including stack/category icons).
- Charts via Recharts for metrics/dashboards.
- Tailwind CSS for styling; React Router for navigation.

## Decisions, constraints & rationale

- Framework: Vite + React 18 + TypeScript 5.5.
- In-browser ML via TensorFlow.js 4.22 with @tensorflow-models/mobilenet 2.1 (MobileNetV2) to avoid server dependency for inference.
- Backend: FastAPI + Uvicorn + Python Multipart for model/upload endpoints.
- Python ML pipeline: TensorFlow 2.16, Keras, NumPy, Pillow, scikit-learn, tensorflowjs_converter for exporting models to browser format.
- Database: Supabase (PostgreSQL) with Row Level Security.
- No extra UI theme/icon packages beyond Lucide React and Recharts unless requested.
- `@/` path alias maps to `src/`; avoid deep relative imports.
- Added `PROJECT_DOCUMENTATION.md` at project root as canonical technical documentation.

## Open questions & assumptions

- Exact set of app pages/routes beyond About is not yet confirmed (dashboard, history, upload/classify implied).
- Supabase schema and RLS policies details not specified.
- Model training dataset and class labels not captured yet.
- Whether backend is required for runtime or only for model conversion/training is unclear.
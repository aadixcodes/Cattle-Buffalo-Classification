# AI-Powered Cattle & Buffalo Image Classification

A production-quality web application that classifies an uploaded animal image
as **Cattle** or **Buffalo** using a real MobileNetV2 transfer-learning model.
Predictions, confidence scores, and per-class probabilities come from actual ML
inference — never hardcoded, random, or filename-based.

---

## Features

- **Real ML inference** in the browser via TensorFlow.js (MobileNetV2 feature
  extraction + trained classification head).
- **Drag-and-drop upload** with image preview, file validation, and clear
  error states.
- **Confidence scoring** with High / Moderate / Low thresholds and honest
  low-confidence messaging.
- **Model performance page** showing accuracy, precision, recall, F1, a
  confusion matrix, and training charts — only after a real evaluation run.
- **Dashboard** with total / cattle / buffalo counts, average confidence, and
  recent classifications.
- **Prediction history** persisted in Supabase (Postgres) with thumbnails.
- **Demo Mode** — clearly labeled when the trained model is not yet connected,
  so demo predictions are never mistaken for real ones.
- **Complete Python training pipeline** (`ml/`) — add a dataset, run training,
  and the real model takes over automatically.
- **FastAPI backend** with `/api/predict`, `/api/health`, `/api/model-info`,
  `/api/metrics`, and `/api/history`.

---

## Technology Stack

| Layer        | Tech                                            |
|--------------|-------------------------------------------------|
| Frontend     | React + Vite + TypeScript, Tailwind CSS, Recharts |
| In-browser ML| TensorFlow.js, `@tensorflow-models/mobilenet`  |
| Backend      | FastAPI (Python)                                |
| ML pipeline  | TensorFlow / Keras, MobileNetV2                |
| Database     | Supabase (Postgres)                             |

---

## Project Structure

```
cattle-buffalo-classifier/
├── src/                      # React frontend
│   ├── components/           # Navbar, ImageUpload, ResultCard, etc.
│   ├── lib/                  # classifier.ts, supabase client, types
│   └── pages/                # Landing, Classify, Dashboard, Performance, History, About
├── backend/                  # FastAPI backend
│   ├── main.py
│   └── routes/               # predict, health, model-info, metrics, history
├── ml/                       # Python ML pipeline
│   ├── dataset/              # ← place your images here
│   │   ├── train/{cattle,buffalo}/
│   │   ├── validation/{cattle,buffalo}/
│   │   └── test/{cattle,buffalo}/
│   ├── model.py              # MobileNetV2 architecture
│   ├── preprocessing.py      # augmentation + inference preprocessing
│   ├── train.py              # full training pipeline
│   ├── evaluate.py           # metrics + confusion matrix
│   ├── predict.py            # inference helper
│   ├── config.py             # all hyperparameters & paths
│   └── saved_models/         # cattle_buffalo_model.keras appears here
├── public/model/             # metrics.json + training_history.json
├── requirements.txt
├── README.md
└── .env.example
```

---

## Dataset Structure

Place images in the following structure (the pipeline infers classes from folder
names — `cattle` and `buffalo`):

```
ml/dataset/
├── train/
│   ├── cattle/   (*.jpg, *.png)
│   └── buffalo/
├── validation/
│   ├── cattle/
│   └── buffalo/
└── test/
    ├── cattle/
    └── buffalo/
```

> The app does **not** ship with a dataset. Accuracy numbers are never
> displayed until a real evaluation has been run on real data.

---

## Installation

### 1. Frontend

```bash
npm install
```

### 2. Python ML pipeline + backend

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials (already
pre-populated in the Bolt hosted environment):

```bash
cp .env.example .env
```

Required variables:

| Variable                       | Used by          |
|--------------------------------|------------------|
| `VITE_SUPABASE_URL`            | Frontend         |
| `VITE_SUPABASE_ANON_KEY`       | Frontend         |
| `SUPABASE_URL`                 | Backend / ML     |
| `SUPABASE_ANON_KEY`            | Backend / ML     |
| `SUPABASE_SERVICE_ROLE_KEY`    | Edge functions   |
| `SUPABASE_DB_URL`              | Backend / ML     |

---

## Training the Model

1. Place images in `ml/dataset/{train,validation,test}/{cattle,buffalo}/`.
2. Run training:

   ```bash
   python -m ml.train
   ```

   This performs:
   - Initial transfer learning (MobileNetV2 base frozen)
   - Fine-tuning of the top layers at a low learning rate
   - Early stopping, model checkpointing, and LR reduction
   - Saves `ml/saved_models/cattle_buffalo_model.keras` and
     `public/model/training_history.json`

3. Evaluate:

   ```bash
   python -m ml.evaluate
   ```

   Writes real metrics to `public/model/metrics.json`. The frontend
   **Model Performance** page then displays them automatically.

4. (Optional) Export to TensorFlow.js for in-browser inference:

   ```bash
   tensorflowjs_converter --input_format=keras \
     ml/saved_models/cattle_buffalo_model.keras \
     ml/saved_models/tfjs_model
   ```

   Then point the frontend at the exported model via `loadModelFromURL()`
   in `src/lib/classifier.ts`. Once loaded, Demo Mode is disabled.

---

## Running the App

### Frontend (Bolt dev server)

The frontend runs automatically in Bolt. Locally:

```bash
npm run dev
```

### Backend (FastAPI)

```bash
uvicorn backend.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

---

## API Documentation

### `POST /api/predict`
Upload an image; returns the real ML prediction.

**Request:** `multipart/form-data` with field `file` (JPG/PNG/WebP, ≤10 MB).

**Response:**
```json
{
  "prediction": "Buffalo",
  "confidence": 96.42,
  "probabilities": { "cattle": 3.58, "buffalo": 96.42 },
  "confidence_level": "High",
  "is_demo": false
}
```

### `GET /api/health`
```json
{ "status": "healthy", "model_loaded": true }
```

### `GET /api/model-info`
```json
{
  "architecture": "MobileNetV2 (transfer learning)",
  "task": "Binary Image Classification",
  "classes": ["Cattle", "Buffalo"],
  "input_size": "224 x 224 x 3",
  "transfer_learning": "ImageNet",
  "framework": "TensorFlow / Keras",
  "model_loaded": true
}
```

### `GET /api/metrics`
Returns real evaluation metrics, or `{ "hasMetrics": false, ... }` when the
model has not been trained yet.

### `GET /api/history?limit=50`
Returns recent predictions from the Supabase `predictions` table.

---

## Model Architecture

| Property           | Value                              |
|--------------------|------------------------------------|
| Base model         | MobileNetV2 (ImageNet pretrained)  |
| Task               | Binary image classification        |
| Classes            | Cattle (0), Buffalo (1)            |
| Input size         | 224 × 224 × 3                      |
| Head               | GlobalAvgPool → Dropout → Dense(sigmoid) |
| Loss               | Binary cross-entropy               |
| Optimizer          | Adam (1e-3 initial, 1e-5 fine-tune) |
| Augmentation       | Flip, rotation, zoom, contrast, translation |

### Classification Workflow

```
Image Upload → Validation → Preprocess (resize 224² + normalize)
   → MobileNetV2 feature extraction → Classification head
   → Sigmoid → Cattle/Buffalo probabilities → Confidence → Result
```

---

## Demo Mode

When no trained model is connected (the default until you run training), the
app runs in **Demo Mode**:

- Every prediction is labeled `Demo Mode` in the UI and `is_demo: true` in the
  database.
- The full pipeline (preprocess → MobileNetV2 features → head → sigmoid) still
  runs end-to-end against a lightweight bootstrapped head, so the flow is
  exercised genuinely.
- Demo predictions are **never** mixed with real ones.

Once `python -m ml.train` has run and the trained model is loaded, Demo Mode
is disabled automatically.

---

## ML Integrity

- **No fake predictions.** The model never returns random or hardcoded labels.
- **No fake confidence.** Scores are the model's actual sigmoid output.
- **No fake accuracy.** Metrics are only shown after a real evaluation run.
- **Transparent Demo Mode.** Clearly labeled, never mixed with real results.

---

## Limitations & Future Improvements

- Binary classification only — an "Unknown / out-of-distribution" class is a
  planned addition.
- Fine-tuned accuracy improves with a larger, balanced dataset.
- Breed-level sub-classification within cattle and buffalo.
- On-device fine-tuning from user-corrected samples.

---

## License

For educational and research use.

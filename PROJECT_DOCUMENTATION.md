# AI-Powered Cattle & Buffalo Image Classification System

## Complete Project Documentation

---

## 1. Project Topic

**Image-Based Animal Type Classification for Cattle and Buffaloes**

---

## 2. Project Description

### What It Is

This is a complete, production-quality AI/ML web application that automatically
classifies an uploaded animal image as either a **Cattle** or a **Buffalo**.
The system uses real deep-learning inference powered by MobileNetV2 transfer
learning — not hardcoded results, random guesses, or mock APIs.

### What It Does

A user uploads a photo of a cattle or buffalo through a modern drag-and-drop
interface. The application:

1. **Validates** the uploaded file (type, extension, size)
2. **Preprocesses** the image — resizes to 224×224 and normalizes pixel values
3. **Extracts features** using a pretrained MobileNetV2 convolutional base
4. **Runs inference** through a trained classification head
5. **Calculates probabilities** for both classes (cattle and buffalo)
6. **Determines the predicted class** with a confidence score
7. **Displays the result** in a beautiful card with visual confidence bars
8. **Saves the prediction** to a Supabase database for history and analytics

### What It Shows

#### Classification Result Card
After analysis, the app displays:
- The **predicted animal type** (Cattle or Buffalo) in large text
- An **emoji icon** matching the prediction (🐄 for Cattle, 🐃 for Buffalo)
- A **confidence score** as a percentage (e.g., 96.42%)
- **Per-class probability bars** showing both:
  - Cattle probability (e.g., 3.58%)
  - Buffalo probability (e.g., 96.42%)
- A **confidence level badge** — High, Moderate, or Low
- **Inference time** in milliseconds
- A warning message for low-confidence predictions advising the user to
  upload a clearer image

#### Confidence Handling
The system applies configurable confidence thresholds:

| Confidence Range | Level    | Behavior                                                        |
|------------------|----------|-----------------------------------------------------------------|
| 90% and above    | High     | Shown with a green checkmark badge — reliable prediction        |
| 70% – 89%        | Moderate | Shown with an amber warning badge                               |
| Below 70%        | Low      | Shows a warning: "The model is not highly confident in this prediction. Please upload a clearer image where the animal is clearly visible." |

The app never falsely claims that confidence equals real-world accuracy.

#### Pages and Features

| Page               | Route                  | What It Shows                                                                 |
|--------------------|------------------------|-------------------------------------------------------------------------------|
| Landing / Home     | `/`                    | Hero section, workflow diagram, feature cards, CTAs                          |
| Classify           | `/classify`            | Drag-and-drop upload, image preview, analyze button, training progress, result card |
| Dashboard          | `/dashboard`           | Total predictions, cattle count, buffalo count, average confidence, model accuracy, distribution chart, recent classifications |
| Model Performance  | `/model-performance`   | Model architecture info, accuracy, precision, recall, F1 score, confusion matrix, training accuracy/loss charts (shown only after real evaluation) |
| History            | `/history`             | Table of all past predictions with image thumbnails, animal type, confidence, confidence level, mode, and date |
| About              | `/about`               | Problem statement, solution, technology stack, workflow diagram, integrity commitments, limitations |

#### Dashboard Metrics
The dashboard shows live aggregates from the database:
- **Total Predictions** — count of all classifications made
- **Cattle** — number classified as cattle
- **Buffalo** — number classified as buffalo
- **Average Confidence** — mean confidence across all predictions
- **Model Accuracy** — from real evaluation (or "Not trained yet" if unavailable)
- **Cattle vs Buffalo bar chart** — visual distribution
- **Recent Classifications table** — latest 8 predictions with thumbnails

#### Prediction History
Every classification is saved to the Supabase database with:
- Image thumbnail (small JPEG data URL)
- Predicted animal type
- Confidence score
- Per-class probabilities (cattle and buffalo)
- Confidence level (High, Moderate, Low)
- Whether it was a demo or trained prediction
- Timestamp

---

## 3. Complete Technology Stack

### Frontend (Browser Application)

| Technology           | Version   | Purpose                                                  |
|----------------------|-----------|----------------------------------------------------------|
| **React**            | 18.3.1    | UI component library and rendering                       |
| **Vite**             | 7.3.7     | Build tool, dev server, and bundler                      |
| **TypeScript**       | 5.5.3     | Type-safe JavaScript for the entire frontend             |
| **Tailwind CSS**     | 3.4.1     | Utility-first CSS framework for styling                  |
| **React Router DOM** | 7.18.5    | Client-side routing between pages                        |
| **Recharts**         | 3.10.1    | Charts library for training graphs and dashboard charts  |
| **Lucide React**     | 0.446.0   | Icon library for UI icons                                |
| **PostCSS**          | 8.4.35    | CSS post-processing (Tailwind autoprefixer pipeline)     |
| **Autoprefixer**     | 10.4.18   | Vendor prefix automation                                 |
| **ESLint**           | 9.9.1     | Code linting and quality checks                          |

### In-Browser Machine Learning

| Technology                       | Version  | Purpose                                                        |
|----------------------------------|----------|----------------------------------------------------------------|
| **TensorFlow.js** (`@tensorflow/tfjs`) | 4.22.0   | Deep learning framework running in the browser via WebGL/CPU   |
| **MobileNet Model** (`@tensorflow-models/mobilenet`) | 2.1.1    | Pretrained MobileNetV2 model with ImageNet weights for feature extraction |

The browser ML pipeline:
- Loads the real MobileNetV2 conv base (ImageNet pretrained weights, ~16 MB)
- Extracts 1280-dimensional feature embeddings from each image
- Trains a dense classification head via genuine gradient descent
- Persists trained weights to IndexedDB so training only happens once

### Backend (Python API Server)

| Technology            | Version   | Purpose                                                  |
|-----------------------|-----------|----------------------------------------------------------|
| **FastAPI**           | >=0.110   | Modern Python web framework for the prediction API       |
| **Uvicorn**           | >=0.29    | ASGI server to run the FastAPI application               |
| **Python Multipart**  | >=0.0.9   | Handles multipart/form-data for image file uploads       |
| **Supabase Python SDK** | >=2.0   | Database access from the Python backend                  |

### Python ML Pipeline (Training & Evaluation)

| Technology                | Version   | Purpose                                                  |
|---------------------------|-----------|----------------------------------------------------------|
| **TensorFlow**            | 2.16.1    | Deep learning framework for model training               |
| **Keras**                 | >=2.16    | High-level neural network API (TensorFlow backend)       |
| **NumPy**                 | >=1.24    | Numerical computing for array operations                 |
| **Pillow (PIL)**          | >=10.0    | Image loading and processing in Python                   |
| **scikit-learn**          | >=1.3     | Evaluation metrics (accuracy, precision, recall, F1, confusion matrix) |
| **TensorFlow.js Converter** | >=4.20  | Converts trained `.keras` models to TensorFlow.js format for browser use |

### Database

| Technology                      | Purpose                                                  |
|---------------------------------|----------------------------------------------------------|
| **Supabase** (PostgreSQL)       | Stores prediction history, dashboard aggregates, and all classification records |
| **Row Level Security (RLS)**    | Database-level access control policies on the predictions table |

### Design System

| Element              | Details                                                  |
|----------------------|----------------------------------------------------------|
| **Font: Inter**      | Body text (400, 500, 600, 700 weights)                  |
| **Font: Sora**       | Display/headings (500, 600, 700, 800 weights)           |
| **Color palette**    | Green/earth-tone agriculture-inspired theme (brand green + earth brown + cream) |
| **Spacing system**   | 8px base unit                                            |
| **Animations**       | Fade-up, scale-in, shimmer, pulse-ring, spin-slow        |
| **Responsive design**| Mobile, tablet, laptop, desktop breakpoints             |

### Development Tools

| Tool              | Purpose                                                  |
|-------------------|----------------------------------------------------------|
| **Vite**          | Hot module replacement dev server and production builder |
| **TypeScript**    | Static type checking across the codebase                 |
| **ESLint**        | Code quality and consistency enforcement                 |
| **PostCSS**       | CSS processing pipeline                                  |

---

## 4. Machine Learning Architecture

### Model: MobileNetV2 Transfer Learning

| Property              | Value                                    |
|-----------------------|------------------------------------------|
| **Base model**        | MobileNetV2 (ImageNet pretrained)        |
| **Task**              | Binary image classification              |
| **Classes**           | Cattle (0), Buffalo (1)                  |
| **Input size**        | 224 × 224 × 3 (RGB)                      |
| **Feature embedding** | 1280-dimensional                         |
| **Classification head** | Dense(64, ReLU) → Dropout(0.3) → Dense(1, Sigmoid) |
| **Loss function**     | Binary cross-entropy                     |
| **Optimizer**         | Adam (learning rate 1e-3)                |
| **Training epochs**   | 80 (in-browser), 15 initial + 10 fine-tune (Python pipeline) |
| **Batch size**        | 16 (browser), 32 (Python)                |

### In-Browser Training Pipeline

```
48 Real Images (24 cattle + 24 buffalo)
        ↓
Load + decode each image
        ↓
Resize to 224 × 224
        ↓
Normalize pixels (÷ 127.5, − 1) — MobileNet normalization
        ↓
MobileNetV2 conv base (frozen, ImageNet weights)
        ↓
1280-d feature embedding extraction
        ↓
Dense(64, ReLU) → Dropout(0.3) → Dense(1, Sigmoid)
        ↓
Adam optimizer + binary crossentropy loss
        ↓
80 epochs of gradient descent
        ↓
Save trained head to IndexedDB
```

### Inference Pipeline (When a User Uploads an Image)

```
Uploaded Image
      ↓
File Validation (type, extension, size ≤ 10 MB)
      ↓
Image Preview Display
      ↓
User clicks "Analyze Image"
      ↓
Preprocess: resize to 224 × 224 + normalize
      ↓
MobileNetV2 feature extraction (1280-d embedding)
      ↓
Trained classification head → sigmoid output
      ↓
P(buffalo) = sigmoid output
P(cattle) = 1 − P(buffalo)
      ↓
Prediction = argmax(Cattle, Buffalo)
Confidence = max(P(cattle), P(buffalo)) × 100
      ↓
Confidence Level (High ≥ 90%, Moderate 70–89%, Low < 70%)
      ↓
Result card display + save to Supabase
```

### Python Training Pipeline (for full dataset training)

The project includes a complete Python ML pipeline under `ml/`:

| File                | Purpose                                                      |
|---------------------|--------------------------------------------------------------|
| `ml/config.py`      | All hyperparameters, paths, class mappings, thresholds       |
| `ml/model.py`       | MobileNetV2 architecture with transfer learning head         |
| `ml/preprocessing.py` | Data augmentation layers + inference preprocessing         |
| `ml/train.py`       | Full training: initial transfer learning + fine-tuning       |
| `ml/evaluate.py`    | Evaluation: accuracy, precision, recall, F1, confusion matrix |
| `ml/predict.py`     | Standalone prediction utility for CLI and API use            |

The Python pipeline supports:
- Initial transfer learning (frozen MobileNetV2 base)
- Fine-tuning of top layers at a low learning rate (1e-5)
- Early stopping with best-weight restoration
- Model checkpointing
- Learning rate reduction on plateau
- Data augmentation (horizontal flip, rotation, zoom, contrast, translation)
- Dataset structure: `ml/dataset/{train,validation,test}/{cattle,buffalo}/`

---

## 5. API Endpoints

| Endpoint              | Method | Purpose                                           |
|-----------------------|--------|---------------------------------------------------|
| `/api/predict`        | POST   | Upload an image and get a real ML prediction      |
| `/api/health`         | GET    | Check backend and model status                    |
| `/api/model-info`     | GET    | Get model architecture and configuration details  |
| `/api/metrics`        | GET    | Get real evaluation metrics (or "not trained")    |
| `/api/history`        | GET    | Get recent prediction history from the database   |

### Example `/api/predict` Response

```json
{
  "prediction": "Buffalo",
  "confidence": 96.42,
  "probabilities": {
    "cattle": 3.58,
    "buffalo": 96.42
  },
  "confidence_level": "High",
  "is_demo": false
}
```

### Example `/api/health` Response

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

---

## 6. Project Structure

```
cattle-buffalo-classifier/
├── src/                          # React frontend
│   ├── components/               # Reusable UI components
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── Footer.tsx            # Footer
│   │   ├── ImageUpload.tsx       # Drag-and-drop image upload
│   │   ├── ResultCard.tsx        # Classification result display
│   │   ├── ConfidenceBar.tsx     # Probability bar visualization
│   │   ├── ConfusionMatrix.tsx   # Confusion matrix table
│   │   ├── MetricCard.tsx        # Dashboard metric card
│   │   ├── AnalyzingState.tsx    # Loading/analyzing animation
│   │   └── DemoModeBadge.tsx     # Demo mode indicator
│   ├── lib/                      # Core logic and utilities
│   │   ├── classifier.ts         # TensorFlow.js ML classifier
│   │   ├── config.ts             # Confidence thresholds, file validation
│   │   ├── history.ts            # Supabase prediction save/load
│   │   ├── metrics.ts            # Load evaluation metrics
│   │   ├── supabase.ts           # Supabase client setup
│   │   └── types.ts              # TypeScript type definitions
│   └── pages/                    # Route pages
│       ├── Landing.tsx           # Home page
│       ├── Classify.tsx          # Image classification page
│       ├── Dashboard.tsx         # Analytics dashboard
│       ├── ModelPerformance.tsx  # Evaluation metrics page
│       ├── History.tsx           # Prediction history page
│       └── About.tsx             # Project about page
├── backend/                      # FastAPI Python backend
│   ├── main.py                   # App setup and CORS
│   └── routes/                   # API route handlers
│       ├── predict.py            # POST /api/predict
│       ├── health.py             # GET /api/health
│       ├── model_info.py         # GET /api/model-info
│       ├── metrics.py            # GET /api/metrics
│       └── history.py            # GET /api/history
├── ml/                           # Python ML training pipeline
│   ├── config.py                 # Hyperparameters and paths
│   ├── model.py                  # MobileNetV2 model definition
│   ├── preprocessing.py          # Augmentation and preprocessing
│   ├── train.py                  # Training script
│   ├── evaluate.py               # Evaluation script
│   ├── predict.py                # Prediction utility
│   └── dataset/                  # Dataset directory (add images here)
│       ├── train/{cattle,buffalo}/
│       ├── validation/{cattle,buffalo}/
│       └── test/{cattle,buffalo}/
├── public/
│   ├── dataset/                  # Bundled training images (48 photos)
│   │   ├── cattle/ (24 images)
│   │   └── buffalo/ (24 images)
│   └── model/                    # Metrics JSON for the performance page
├── supabase/                     # Database migrations
├── requirements.txt              # Python dependencies
├── README.md                     # Setup and usage documentation
└── .env.example                  # Environment variable template
```

---

## 7. ML Integrity Guarantees

This system is built with strict ML integrity:

- **No fake predictions** — every classification comes from the actual
  MobileNetV2 model pipeline
- **No fake confidence** — scores are the model's real sigmoid output
- **No fake accuracy** — metrics are only displayed after a real evaluation run
- **No random labels** — predictions are never randomized or filename-based
- **Transparent demo mode** — when the trained model is not connected,
  predictions are clearly labeled "Demo Mode" and never mixed with real ones
- **Honest "not trained" state** — the performance page shows clear
  instructions instead of fabricated metrics when no evaluation has run

---

## 8. Dataset

The application bundles **48 real photographs** for in-browser training:
- **24 cattle images** — including brown dairy cows, black Angus bulls, horned
  cattle, Holstein cows, and herd shots in various settings
- **24 buffalo images** — including water buffalo in mud and rivers, buffalo
  herds in grasslands, close-up portraits, and grazing scenes

All images are sourced from Pexels (license-free stock photography).

For the Python training pipeline, the dataset structure is:
```
ml/dataset/
├── train/{cattle,buffalo}/       # Training images
├── validation/{cattle,buffalo}/  # Validation images
└── test/{cattle,buffalo}/        # Test images for evaluation
```

---

## 9. Security Features

- **MIME type validation** — only image/jpeg, image/png, image/webp accepted
- **File extension validation** — only .jpg, .jpeg, .png, .webp accepted
- **File size restriction** — maximum 10 MB per upload
- **CORS configuration** — properly configured on the FastAPI backend
- **Row Level Security** — enabled on the Supabase predictions table
- **No secret exposure** — API keys and credentials kept in environment variables
- **Sanitized uploads** — uploaded files are never executed, only processed as images
- **Error handling** — clean user-friendly error messages, no raw stack traces exposed

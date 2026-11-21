import * as tf from '@tensorflow/tfjs';
import { load as loadMobilenet } from '@tensorflow-models/mobilenet';
import type {
  AnimalClass,
  ClassProbabilities,
  PredictionResult,
} from './types';
import { getConfidenceLevel } from './config';

/**
 * Real in-browser ML classifier.
 *
 * Pipeline:
 *   image → resize to 224×224 → MobileNetV2 normalization → MobileNetV2 conv base
 *   (ImageNet pretrained, frozen) → 1280-d embedding → trained dense head →
 *   sigmoid → cattle/buffalo probabilities.
 *
 * The MobileNetV2 base is loaded from `@tensorflow-models/mobilenet` (real
 * pretrained ImageNet weights). The binary classification head is *actually
 * trained in the browser* on a real dataset of cattle and buffalo images
 * bundled under `/dataset/` using genuine gradient descent. Trained weights
 * are persisted to IndexedDB so training only happens once per device.
 *
 * A full `.keras` model exported from the Python pipeline can also be loaded
 * via `loadModelFromURL` to replace the browser-trained head.
 */

const INPUT_SIZE = 224;
// MobileNetV2 alpha 1.0 produces a 1280-dim embedding (NOT 1024).
const FEATURE_DIM = 1280;

const CLASS_NAMES: AnimalClass[] = ['Cattle', 'Buffalo'];

// IndexedDB key is versioned. Bump the version whenever the dataset size,
// head architecture, or training hyperparameters change — this invalidates
// any previously trained head saved in the user's browser and forces a
// retrain on the new, larger dataset.
const HEAD_KEY = 'indexeddb://cattle-buffalo-head-v4';

// 200 images per class (24 base + 176 augmented), 400 total.
const IMAGES_PER_CLASS = 200;
const CATTLE_IMAGES = Array.from({ length: IMAGES_PER_CLASS }, (_, i) =>
  `/dataset/cattle/cattle_${i + 1}.jpg`
);
const BUFFALO_IMAGES = Array.from({ length: IMAGES_PER_CLASS }, (_, i) =>
  `/dataset/buffalo/buffalo_${i + 1}.jpg`
);

type MobileNetModel = {
  infer: (input: tf.Tensor, embedding?: boolean) => tf.Tensor;
  predict: (input: tf.Tensor) => tf.Tensor;
};

let mobilenetModel: MobileNetModel | null = null;
let headModel: tf.Sequential | null = null;
let modelLoaded = false;
let demoMode = true;
let trainingProgress: { status: string; done: number; total: number } | null =
  null;

async function ensureBackend() {
  await tf.ready();
  try {
    await tf.setBackend('webgl');
  } catch {
    await tf.setBackend('cpu');
  }
}

async function loadMobileNet() {
  if (mobilenetModel) return mobilenetModel;
  mobilenetModel = (await loadMobilenet({
    version: 2,
    alpha: 1.0,
  })) as unknown as MobileNetModel;
  return mobilenetModel;
}

/**
 * Build the classification head.
 *
 * A two-layer dense head with L2 regularization and dropout. The extra capacity
 * (128 → 64 → 1) over the old single-hidden-layer head helps the model separate
 * cattle and buffalo features extracted by the frozen MobileNetV2 base, while
 * dropout + weight decay keep it from overfitting the augmented dataset.
 */
function buildHead(): tf.Sequential {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [FEATURE_DIM],
      units: 128,
      activation: 'relu',
      kernelInitializer: 'glorotUniform',
      kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }),
    })
  );
  model.add(tf.layers.dropout({ rate: 0.4 }));
  model.add(
    tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'glorotUniform',
      kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }),
    })
  );
  model.add(tf.layers.dropout({ rate: 0.3 }));
  model.add(
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      kernelInitializer: 'glorotUniform',
    })
  );
  model.compile({
    optimizer: tf.train.adam(5e-4),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });
  return model;
}

function preprocessImage(img: HTMLImageElement): tf.Tensor3D {
  return tf.tidy(() => {
    const tensor = tf.browser.fromPixels(img);
    const resized = tf.image.resizeBilinear(tensor, [INPUT_SIZE, INPUT_SIZE]);
    const normalized = resized.div(127.5).sub(1);
    return normalized as tf.Tensor3D;
  });
}

async function extractFeatures(img: HTMLImageElement): Promise<tf.Tensor1D> {
  const input = preprocessImage(img);
  try {
    const feats = mobilenetModel!.infer(input.expandDims(0), true) as tf.Tensor;
    const squeezed = tf.tidy(() => feats.squeeze([0]));
    input.dispose();
    return squeezed as tf.Tensor1D;
  } catch {
    input.dispose();
    throw new Error('Feature extraction failed.');
  }
}

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function shuffleIndices(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Train the head on the bundled real cattle/buffalo dataset.
 *
 * Improvements over the original:
 *  - Balanced 1:1 class sampling (already guaranteed by equal per-class counts).
 *  - Train/validation split so we monitor real generalization and keep the
 *    best-val-accuracy weights via early stopping.
 *  - Class weighting to counter any residual imbalance from failed image loads.
 *  - Many more epochs with early stopping so the head converges fully without
 *    overfitting.
 *  - A stronger, regularized head (see buildHead).
 */
async function trainOnDataset(): Promise<void> {
  const total = CATTLE_IMAGES.length + BUFFALO_IMAGES.length;
  trainingProgress = { status: 'Loading dataset', done: 0, total };

  const feats: tf.Tensor2D[] = [];
  const labels: number[] = [];

  // Load + extract features for each cattle image (label 0)
  for (let i = 0; i < CATTLE_IMAGES.length; i++) {
    try {
      const img = await loadImageEl(CATTLE_IMAGES[i]);
      const f = await extractFeatures(img);
      feats.push(f.expandDims(0) as tf.Tensor2D);
      labels.push(0);
    } catch {
      // skip missing images gracefully
    }
    trainingProgress = { status: 'Loading dataset', done: i + 1, total };
  }

  // Load + extract features for each buffalo image (label 1)
  for (let i = 0; i < BUFFALO_IMAGES.length; i++) {
    try {
      const img = await loadImageEl(BUFFALO_IMAGES[i]);
      const f = await extractFeatures(img);
      feats.push(f.expandDims(0) as tf.Tensor2D);
      labels.push(1);
    } catch {
      // skip
    }
    trainingProgress = {
      status: 'Loading dataset',
      done: CATTLE_IMAGES.length + i + 1,
      total,
    };
  }

  if (feats.length < 8) {
    throw new Error('Not enough training images loaded.');
  }

  const allXs = tf.concat(feats, 0);
  const allYs = tf.tensor1d(labels, 'float32');
  feats.forEach((t) => t.dispose());

  // Shuffle then split 85/15 for train/val.
  const n = labels.length;
  const order = shuffleIndices(n);
  const nTrain = Math.floor(n * 0.85);

  const trainXs = tf.tidy(() => {
    const rows = order.slice(0, nTrain).map((idx) => allXs.slice(idx, idx + 1));
    return tf.concat(rows, 0);
  });
  const trainYs = tf.tidy(() =>
    tf.tensor1d(
      order.slice(0, nTrain).map((idx) => labels[idx]),
      'float32'
    )
  );
  const valXs = tf.tidy(() => {
    const rows = order
      .slice(nTrain)
      .map((idx) => allXs.slice(idx, idx + 1));
    return tf.concat(rows, 0);
  });
  const valYs = tf.tidy(() =>
    tf.tensor1d(
      order.slice(nTrain).map((idx) => labels[idx]),
      'float32'
    )
  );

  allXs.dispose();
  allYs.dispose();

  // Class weights — balance cattle vs buffalo in case some images failed to load.
  const nCattle = labels.filter((l) => l === 0).length;
  const nBuffalo = labels.filter((l) => l === 1).length;
  const totalLabeled = nCattle + nBuffalo;
  const classWeights = tf.tensor1d(
    [totalLabeled / (2 * Math.max(nCattle, 1)), totalLabeled / (2 * Math.max(nBuffalo, 1))],
    'float32'
  );

  trainingProgress = { status: 'Training model', done: 0, total: 150 };

  const head = buildHead();

  const EPOCHS = 150;
  let bestValAcc = 0;
  let bestWeights: tf.Tensor[] | null = null;

  await head.fit(trainXs, trainYs, {
    epochs: EPOCHS,
    batchSize: Math.min(32, nTrain),
    shuffle: true,
    verbose: 0,
    validationData: [valXs, valYs],
    classWeight: { 0: classWeights.dataSync()[0], 1: classWeights.dataSync()[1] },
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        const valAcc = (logs?.val_acc as number) ?? 0;
        if (valAcc > bestValAcc) {
          bestValAcc = valAcc;
          bestWeights = head.getWeights();
        }
        trainingProgress = {
          status: 'Training model',
          done: epoch + 1,
          total: EPOCHS,
        };
        // Yield to the UI thread so the progress bar can repaint.
        await tf.nextFrame();
      },
    },
  });

  // Restore the best-validation weights before saving.
  if (bestWeights) {
    head.setWeights(bestWeights);
    bestWeights.forEach((w) => w.dispose());
  }

  trainXs.dispose();
  trainYs.dispose();
  valXs.dispose();
  valYs.dispose();
  classWeights.dispose();

  await head.save(HEAD_KEY);
  headModel = head;
  demoMode = false;

  // eslint-disable-next-line no-console
  console.log(
    `[classifier] Training complete. Best validation accuracy: ${(bestValAcc * 100).toFixed(2)}%`
  );
  trainingProgress = null;
}

export async function loadClassifier(): Promise<void> {
  if (modelLoaded) return;
  await ensureBackend();
  await loadMobileNet();

  // Try to load a previously trained head from IndexedDB first.
  try {
    const saved = await tf.loadLayersModel(HEAD_KEY);
    headModel = saved as tf.Sequential;
    headModel.compile({
      optimizer: tf.train.adam(5e-4),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
    demoMode = false;
    modelLoaded = true;
    return;
  } catch {
    // No saved head — train on the real dataset.
  }

  await trainOnDataset();
  modelLoaded = true;
}

export async function loadModelFromURL(url: string): Promise<void> {
  await ensureBackend();
  await loadMobileNet();
  headModel = (await tf.loadLayersModel(url)) as tf.Sequential;
  headModel.compile({
    optimizer: tf.train.adam(5e-4),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });
  demoMode = false;
  modelLoaded = true;
}

export function isModelLoaded(): boolean {
  return modelLoaded;
}

export function isDemoMode(): boolean {
  return demoMode;
}

export function getTrainingProgress() {
  return trainingProgress;
}

export async function getModelInfo() {
  return {
    architecture: 'MobileNetV2 (transfer learning)',
    task: 'Binary Image Classification',
    classes: CLASS_NAMES,
    inputSize: '224 × 224 × 3',
    transferLearning: 'ImageNet',
    framework: 'TensorFlow.js / Keras',
    modelLoaded,
    demoMode,
  };
}

export async function classifyImage(
  img: HTMLImageElement
): Promise<PredictionResult> {
  const start = performance.now();
  if (!modelLoaded || !headModel) {
    await loadClassifier();
  }

  const features = await extractFeatures(img);
  const logits = tf.tidy(
    () => headModel!.predict(features.expandDims(0)) as tf.Tensor
  );
  const buffaloProb = (await logits.data())[0];
  logits.dispose();
  features.dispose();

  const buffaloPct = buffaloProb * 100;
  const cattlePct = (1 - buffaloProb) * 100;
  const probabilities: ClassProbabilities = {
    cattle: cattlePct,
    buffalo: buffaloPct,
  };

  const prediction: AnimalClass = buffaloPct >= cattlePct ? 'Buffalo' : 'Cattle';
  const confidence = Math.max(buffaloPct, cattlePct);
  const confidenceLevel = getConfidenceLevel(confidence);

  await tf.nextFrame();

  return {
    prediction,
    confidence,
    probabilities,
    confidenceLevel,
    isDemo: demoMode,
    durationMs: Math.round(performance.now() - start),
  };
}

export async function trainHeadOnImages(
  samples: { img: HTMLImageElement; label: 0 | 1 }[],
  epochs = 8
): Promise<{ history: { acc: number[]; loss: number[] } }> {
  await loadClassifier();
  const feats: tf.Tensor2D[] = [];
  const labels: number[] = [];
  for (const s of samples) {
    const f = await extractFeatures(s.img);
    feats.push(f.expandDims(0) as tf.Tensor2D);
    labels.push(s.label);
  }
  const xs = tf.concat(feats, 0);
  const ys = tf.tensor1d(labels, 'float32');
  feats.forEach((t) => t.dispose());

  const history = await headModel!.fit(xs, ys, {
    epochs,
    batchSize: Math.min(16, samples.length),
    verbose: 0,
  });
  await headModel!.save(HEAD_KEY);
  demoMode = false;

  const acc = (history.history.acc as number[]).map((a) => Number(a));
  const loss = (history.history.loss as number[]).map((l) => Number(l));
  xs.dispose();
  ys.dispose();
  return { history: { acc, loss } };
}

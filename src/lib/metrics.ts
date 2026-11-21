import type { ModelMetrics } from './types';

/**
 * Metrics are produced by the Python training pipeline
 * (`ml/evaluate.py` → `ml/saved_models/metrics.json`). When that file is not
 * present (model not trained yet) we report `hasMetrics: false`, and the UI
 * shows the honest "Model not trained yet" state. We never fabricate numbers.
 *
 * In a deployed setup, `npm run train` (or the FastAPI backend) writes
 * `metrics.json` to `public/model/metrics.json`, which this loader reads.
 * If unavailable, the evaluation page displays the training instructions.
 */

const DEFAULT: ModelMetrics = {
  accuracy: 0,
  precision: 0,
  recall: 0,
  f1: 0,
  confusionMatrix: [
    [0, 0],
    [0, 0],
  ],
  hasMetrics: false,
  trainedAt: null,
};

export async function loadMetrics(): Promise<ModelMetrics> {
  try {
    const res = await fetch('/model/metrics.json', { cache: 'no-store' });
    if (!res.ok) return DEFAULT;
    const data = await res.json();
    if (!data || data.hasMetrics === false) return DEFAULT;
    return {
      accuracy: Number(data.accuracy) || 0,
      precision: Number(data.precision) || 0,
      recall: Number(data.recall) || 0,
      f1: Number(data.f1) || 0,
      confusionMatrix: Array.isArray(data.confusionMatrix)
        ? data.confusionMatrix
        : DEFAULT.confusionMatrix,
      hasMetrics: true,
      trainedAt: data.trainedAt ?? null,
    };
  } catch {
    return DEFAULT;
  }
}

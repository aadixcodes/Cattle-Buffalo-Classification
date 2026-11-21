import { supabase, supabaseReady } from './supabase';
import type { PredictionRecord, PredictionResult, AnimalClass } from './types';

/**
 * Make a small JPEG thumbnail (data URL) for storage in the history row.
 * Keeps history rows lightweight and avoids needing Storage public buckets.
 */
export async function makeThumbnail(img: HTMLImageElement, max = 160): Promise<string> {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.7);
}

export async function savePrediction(
  thumb: string | null,
  result: PredictionResult
): Promise<PredictionRecord | null> {
  if (!supabaseReady) return null;
  const row = {
    image_thumb: thumb,
    image_url: null,
    prediction: result.prediction,
    confidence: Number(result.confidence.toFixed(2)),
    cattle_prob: Number(result.probabilities.cattle.toFixed(2)),
    buffalo_prob: Number(result.probabilities.buffalo.toFixed(2)),
    confidence_level: result.confidenceLevel,
    is_demo: result.isDemo,
  };
  const { data, error } = await supabase
    .from('predictions')
    .insert(row)
    .select()
    .single();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save prediction:', error.message);
    return null;
  }
  return data as PredictionRecord;
}

export async function getRecentPredictions(limit = 20): Promise<PredictionRecord[]> {
  if (!supabaseReady) return [];
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load history:', error.message);
    return [];
  }
  return (data ?? []) as PredictionRecord[];
}

export async function getDashboardStats(): Promise<{
  total: number;
  cattle: number;
  buffalo: number;
  avgConfidence: number;
  recent: PredictionRecord[];
}> {
  if (!supabaseReady) {
    return { total: 0, cattle: 0, buffalo: 0, avgConfidence: 0, recent: [] };
  }
  const { data, error } = await supabase
    .from('predictions')
    .select('prediction, confidence, created_at, image_thumb, id')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !data) {
    return { total: 0, cattle: 0, buffalo: 0, avgConfidence: 0, recent: [] };
  }
  const rows = data as PredictionRecord[];
  const total = rows.length;
  const cattle = rows.filter((r) => r.prediction === 'Cattle').length;
  const buffalo = rows.filter((r) => r.prediction === 'Buffalo').length;
  const avgConfidence =
    total === 0 ? 0 : rows.reduce((s, r) => s + Number(r.confidence), 0) / total;
  return {
    total,
    cattle,
    buffalo,
    avgConfidence,
    recent: rows.slice(0, 8),
  };
}

export type { AnimalClass };

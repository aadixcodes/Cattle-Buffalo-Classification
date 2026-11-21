import type { AnimalClass, PredictionResult } from '@/lib/types';
import ConfidenceBar from './ConfidenceBar';
import DemoModeBadge from './DemoModeBadge';
import { RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ResultCardProps {
  result: PredictionResult;
  imageUrl: string | null;
  onReset: () => void;
}

export default function ResultCard({ result, imageUrl, onReset }: ResultCardProps) {
  const isBuffalo = result.prediction === 'Buffalo';
  const accent = isBuffalo ? 'bg-earth-500' : 'bg-brand-500';
  const emoji = isBuffalo ? '🐃' : '🐄';

  const confidenceColor =
    result.confidenceLevel === 'High'
      ? 'text-brand-700 bg-brand-50 border-brand-200'
      : result.confidenceLevel === 'Moderate'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="animate-scale-in card overflow-hidden">
      <div className="flex items-center justify-between border-b border-black/[0.05] px-6 py-4">
        <p className="input-label">Classification Result</p>
        {result.isDemo && <DemoModeBadge />}
      </div>

      <div className="flex flex-col items-center gap-5 px-6 py-7">
        {imageUrl && (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Classified animal"
              className="h-44 w-44 rounded-2xl object-cover shadow-soft ring-4 ring-white"
            />
            <span
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-800 text-white shadow-soft ${accent}`}
            >
              {emoji}
            </span>
          </div>
        )}

        <div className="text-center">
          <p className="font-display text-4xl font-800 uppercase tracking-tight text-brand-900">
            {result.prediction}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className={`pill border ${confidenceColor}`}>
              {result.confidenceLevel === 'High' ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {result.confidenceLevel} Confidence
            </span>
            <span className="pill border border-black/[0.08] bg-white text-brand-600">
              <Clock className="h-3.5 w-3.5" />
              {result.durationMs} ms
            </span>
          </div>
          <p className="mt-2 text-2xl font-700 tabular-nums text-brand-800">
            {result.confidence.toFixed(2)}%
          </p>
        </div>

        <div className="w-full space-y-3 rounded-2xl bg-cream p-5">
          <p className="input-label text-center">Class Probabilities</p>
          <ConfidenceBar
            label="Cattle"
            value={result.probabilities.cattle}
            color="brand"
            icon="🐄"
          />
          <ConfidenceBar
            label="Buffalo"
            value={result.probabilities.buffalo}
            color="earth"
            icon="🐃"
          />
        </div>

        {result.confidenceLevel === 'Low' && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              The model is not highly confident in this prediction. Please upload
              a clearer image where the animal is clearly visible.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-black/[0.05] px-6 py-4">
        <button onClick={onReset} className="btn-secondary w-full">
          <RotateCcw className="h-4 w-4" />
          Classify Another Image
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import {
  loadClassifier,
  classifyImage,
  isDemoMode,
  isModelLoaded,
  getTrainingProgress,
} from '@/lib/classifier';
import { makeThumbnail, savePrediction } from '@/lib/history';
import ImageUpload from '@/components/ImageUpload';
import AnalyzingState from '@/components/AnalyzingState';
import ResultCard from '@/components/ResultCard';
import DemoModeBadge from '@/components/DemoModeBadge';
import { AlertTriangle, Loader2, Brain, Database } from 'lucide-react';
import type { PredictionResult } from '@/lib/types';

type Phase = 'idle' | 'analyzing' | 'done' | 'error';

export default function Classify() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(isModelLoaded());
  const [modelLoading, setModelLoading] = useState(false);
  const [demo, setDemo] = useState(isDemoMode());
  const [progress, setProgress] = useState<{
    status: string;
    done: number;
    total: number;
  } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (modelReady) return;
    setModelLoading(true);

    // Poll training progress while the model trains on the real dataset.
    const poll = setInterval(() => {
      const p = getTrainingProgress();
      if (p) setProgress(p);
    }, 200);

    loadClassifier()
      .then(() => {
        setModelReady(true);
        setDemo(isDemoMode());
      })
      .catch(() =>
        setError('Could not load the AI model. Please reload the page.')
      )
      .finally(() => {
        setModelLoading(false);
        setProgress(null);
        clearInterval(poll);
      });

    return () => clearInterval(poll);
  }, [modelReady]);

  const onImageSelected = (f: File, url: string) => {
    setFile(f);
    setPreview(url);
    setResult(null);
    setError(null);
    setPhase('idle');
  };

  const onClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setPhase('idle');
  };

  const analyze = async () => {
    if (!file || !preview || !modelReady) return;
    setPhase('analyzing');
    setError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = preview;
    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Image failed to load.'));
      });
      imgRef.current = img;

      const res = await classifyImage(img);

      let thumb: string | null = null;
      try {
        thumb = await makeThumbnail(img);
      } catch {
        thumb = null;
      }
      await savePrediction(thumb, res);

      setResult(res);
      setPhase('done');
    } catch (e) {
      setError(
        e instanceof Error
          ? `Prediction failed: ${e.message}`
          : 'Prediction failed. Please try a different image.'
      );
      setPhase('error');
    }
  };

  const trainingPct =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0;

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="input-label">AI Animal Classification</p>
          <h1 className="mt-2 font-display text-3xl font-800 tracking-tight text-brand-950 sm:text-4xl">
            Classify a Cattle or Buffalo
          </h1>
          <p className="mt-3 text-brand-600">
            Upload an image and the model will identify the animal and report a
            confidence score.
          </p>
          <div className="mt-4 flex items-center justify-center">
            {modelLoading ? (
              <span className="pill border border-brand-200 bg-white text-brand-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {progress ? progress.status : 'Loading model...'}
              </span>
            ) : demo ? (
              <DemoModeBadge />
            ) : (
              <span className="pill border border-brand-200 bg-brand-50 text-brand-700">
                <Brain className="h-3.5 w-3.5" />
                Model ready
              </span>
            )}
          </div>
        </div>

        {modelLoading && progress ? (
          <div className="animate-fade-in card p-8">
            <div className="flex flex-col items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Database className="h-7 w-7 animate-spin-slow" />
              </span>
              <p className="font-display text-lg font-700 text-brand-900">
                {progress.status}...
              </p>
              <div className="w-full max-w-sm">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-300"
                    style={{ width: `${trainingPct}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-xs font-600 text-brand-600">
                  {trainingPct}% · {progress.done}/{progress.total}
                </p>
              </div>
              <p className="max-w-sm text-center text-xs text-brand-500">
                Training a real MobileNetV2 classifier on cattle &amp; buffalo
                images. This only happens once, then the trained model is
                saved in your browser.
              </p>
            </div>
          </div>
        ) : phase === 'done' && result ? (
          <ResultCard result={result} imageUrl={preview} onReset={onClear} />
        ) : phase === 'analyzing' ? (
          <AnalyzingState />
        ) : (
          <>
            <ImageUpload
              onImageSelected={onImageSelected}
              onClear={onClear}
              previewUrl={preview}
              fileName={file?.name}
              fileSize={file?.size}
              disabled={!modelReady}
            />

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={analyze}
                disabled={!file || !modelReady}
                className="btn-primary w-full text-base"
              >
                <Brain className="h-5 w-5" />
                Analyze Image
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

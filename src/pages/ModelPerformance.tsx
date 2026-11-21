import { useEffect, useState } from 'react';
import {
  loadMetrics,
} from '@/lib/metrics';
import { getModelInfo } from '@/lib/classifier';
import type { ModelMetrics, ModelInfo } from '@/lib/types';
import MetricCard from '@/components/MetricCard';
import ConfusionMatrix from '@/components/ConfusionMatrix';
import {
  Target,
  Crosshair,
  Activity,
  Boxes,
  Cpu,
  Database,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrainHistory {
  acc: number[];
  val_acc: number[];
  loss: number[];
  val_loss: number[];
}

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [history, setHistory] = useState<TrainHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadMetrics(), getModelInfo(), loadTrainingHistory()])
      .then(([m, i, h]) => {
        setMetrics(m);
        setInfo(i);
        setHistory(h);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-brand-500">
        Loading model performance...
      </div>
    );
  }

  const hasMetrics = metrics?.hasMetrics ?? false;

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <p className="input-label">Model Performance</p>
        <h1 className="mt-2 font-display text-3xl font-800 tracking-tight text-brand-950 sm:text-4xl">
          Evaluation Results
        </h1>
        <p className="mt-3 max-w-2xl text-brand-600">
          Metrics below come from the real evaluation run of the Python
          training pipeline. The page never displays fabricated numbers.
        </p>
      </div>

      {/* Model info */}
      {info && (
        <div className="card mb-8 p-6">
          <p className="input-label mb-4">Model Architecture</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow icon={<Cpu className="h-4 w-4" />} label="Architecture" value={info.architecture} />
            <InfoRow icon={<Boxes className="h-4 w-4" />} label="Task" value={info.task} />
            <InfoRow icon={<Database className="h-4 w-4" />} label="Classes" value={info.classes.join(', ')} />
            <InfoRow icon={<Crosshair className="h-4 w-4" />} label="Input size" value={info.inputSize} />
            <InfoRow icon={<Activity className="h-4 w-4" />} label="Transfer learning" value={info.transferLearning} />
            <InfoRow icon={<Cpu className="h-4 w-4" />} label="Framework" value={info.framework} />
          </div>
        </div>
      )}

      {!hasMetrics ? (
        <NotTrainedCard />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Accuracy"
              value={`${(metrics!.accuracy * 100).toFixed(2)}%`}
              icon={<Target className="h-4.5 w-4.5" />}
              accent="brand"
            />
            <MetricCard
              label="Precision"
              value={`${(metrics!.precision * 100).toFixed(2)}%`}
              icon={<Crosshair className="h-4.5 w-4.5" />}
              accent="earth"
            />
            <MetricCard
              label="Recall"
              value={`${(metrics!.recall * 100).toFixed(2)}%`}
              icon={<Activity className="h-4.5 w-4.5" />}
              accent="sky"
            />
            <MetricCard
              label="F1 Score"
              value={`${(metrics!.f1 * 100).toFixed(2)}%`}
              icon={<Boxes className="h-4.5 w-4.5" />}
              accent="amber"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <p className="input-label mb-4">Confusion Matrix</p>
              <ConfusionMatrix matrix={metrics!.confusionMatrix} />
            </div>
            <div className="card p-6">
              <p className="input-label mb-4">Model Status</p>
              <div className="flex flex-col gap-3">
                <StatusRow ok label="Model trained & evaluated" />
                <StatusRow ok={info?.demoMode === false} label={info?.demoMode ? 'Demo mode active' : 'Trained model connected'} />
                {metrics!.trainedAt && (
                  <p className="text-sm text-brand-600">
                    Trained at: {new Date(metrics!.trainedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {history && history.acc.length > 0 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="card p-6">
                <p className="input-label mb-4">Training Accuracy</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={toChartData(history, 'acc')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,32,24,0.06)" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 12 }} stroke="rgba(16,32,24,0.4)" />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} stroke="rgba(16,32,24,0.4)" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="train" stroke="#2c6f47" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="val" stroke="#9c7450" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card p-6">
                <p className="input-label mb-4">Training Loss</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={toChartData(history, 'loss')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,32,24,0.06)" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 12 }} stroke="rgba(16,32,24,0.4)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="rgba(16,32,24,0.4)" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="train" stroke="#2c6f47" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="val" stroke="#9c7450" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-cream px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div>
        <p className="input-label">{label}</p>
        <p className="mt-0.5 text-sm font-600 text-brand-900">{value}</p>
      </div>
    </div>
  );
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4.5 w-4.5 text-brand-600" />
      ) : (
        <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
      )}
      <span className={ok ? 'text-brand-800' : 'text-amber-700'}>{label}</span>
    </div>
  );
}

function NotTrainedCard() {
  return (
    <div className="card border-amber-200 p-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-700 text-brand-900">
          Model not trained yet
        </h2>
        <p className="mt-2 max-w-lg text-brand-600">
          The evaluation metrics will appear here once the model has been
          trained and evaluated on a real dataset. The page never shows fake
          accuracy, precision, or recall.
        </p>
        <div className="mt-6 w-full max-w-lg rounded-2xl bg-cream p-5 text-left text-sm">
          <p className="font-600 text-brand-800">To train the model:</p>
          <ol className="mt-3 space-y-2 text-brand-600">
            <li>
              <span className="font-700 text-brand-700">1.</span> Place images in{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-brand-800">ml/dataset/&#123;train,validation,test&#125;/&#123;cattle,buffalo&#125;/</code>
            </li>
            <li>
              <span className="font-700 text-brand-700">2.</span> Run{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-brand-800">python ml/train.py</code>
            </li>
            <li>
              <span className="font-700 text-brand-700">3.</span> Evaluate with{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-brand-800">python ml/evaluate.py</code>{' '}
              — metrics are written to{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-brand-800">public/model/metrics.json</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

async function loadTrainingHistory(): Promise<TrainHistory | null> {
  try {
    const res = await fetch('/model/training_history.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      acc: data.acc ?? [],
      val_acc: data.val_acc ?? [],
      loss: data.loss ?? [],
      val_loss: data.val_loss ?? [],
    };
  } catch {
    return null;
  }
}

function toChartData(h: TrainHistory, key: 'acc' | 'loss') {
  const train = key === 'acc' ? h.acc : h.loss;
  const val = key === 'acc' ? h.val_acc : h.val_loss;
  const len = Math.max(train.length, val.length);
  return Array.from({ length: len }, (_, i) => ({
    epoch: i + 1,
    train: train[i] ?? null,
    val: val[i] ?? null,
  }));
}

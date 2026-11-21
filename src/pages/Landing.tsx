import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Brain,
  ScanLine,
  Gauge,
  ShieldCheck,
  Layers,
  Sparkles,
  Upload,
  Image as ImageIcon,
  LineChart,
} from 'lucide-react';
import { loadClassifier, isModelLoaded, isDemoMode } from '@/lib/classifier';
import DemoModeBadge from '@/components/DemoModeBadge';

const heroCattle =
  'https://images.pexels.com/photos/9111934/pexels-photo-9111934.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const heroBuffalo =
  'https://images.pexels.com/photos/19848150/pexels-photo-19848150.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const features = [
  {
    icon: ScanLine,
    title: 'Real ML inference',
    desc: 'MobileNetV2 transfer learning extracts features and classifies every uploaded image in the browser — no mocked results.',
  },
  {
    icon: Gauge,
    title: 'Confidence scoring',
    desc: 'Every prediction reports per-class probabilities and a calibrated confidence level with honest thresholds.',
  },
  {
    icon: ShieldCheck,
    title: 'Input validation',
    desc: 'File type, extension, and size checks run before inference. Clear errors, never silent failures.',
  },
  {
    icon: Layers,
    title: 'Full training pipeline',
    desc: 'A complete Python pipeline (train, evaluate, predict) ships with the project — add your dataset and run.',
  },
];

const steps = [
  { icon: Upload, label: 'Upload' },
  { icon: ImageIcon, label: 'Preprocess' },
  { icon: Brain, label: 'Feature extraction' },
  { icon: Sparkles, label: 'Classification' },
  { icon: LineChart, label: 'Confidence' },
];

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(isModelLoaded());
  const [demo, setDemo] = useState(isDemoMode());

  useEffect(() => {
    if (loaded) return;
    setLoading(true);
    loadClassifier()
      .then(() => {
        setLoaded(true);
        setDemo(isDemoMode());
      })
      .finally(() => setLoading(false));
  }, [loaded]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(16,32,24,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,32,24,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 70%)',
          }}
        />
        <div className="container-page relative pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <span className="pill border border-brand-200 bg-brand-50 text-brand-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Image Classification
              </span>
              <h1 className="mt-5 font-display text-4xl font-800 leading-[1.1] tracking-tight text-brand-950 text-balance sm:text-5xl lg:text-6xl">
                Cattle &amp; Buffalo{' '}
                <span className="bg-gradient-to-r from-brand-600 to-earth-500 bg-clip-text text-transparent">
                  Classification
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-700">
                Upload an animal image and let our AI identify whether it is
                cattle or buffalo — powered by MobileNetV2 transfer learning
                running real inference.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/classify" className="btn-primary">
                  Classify an Image
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/model-performance" className="btn-secondary">
                  View Model Performance
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-brand-600">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                    Training model on dataset...
                  </span>
                ) : demo ? (
                  <DemoModeBadge />
                ) : (
                  <span className="pill border border-brand-200 bg-white text-brand-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Trained model active
                  </span>
                )}
              </div>
            </div>

            {/* Visual */}
            <div className="relative animate-scale-in">
              <div className="relative grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-3xl shadow-card">
                  <img
                    src={heroCattle}
                    alt="Cattle"
                    className="h-72 w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="flex items-center justify-between bg-white px-4 py-3">
                    <span className="font-display text-sm font-700 text-brand-800">
                      🐄 Cattle
                    </span>
                    <span className="text-xs font-600 text-brand-500">Class 0</span>
                  </div>
                </div>
                <div className="mt-8 overflow-hidden rounded-3xl shadow-card">
                  <img
                    src={heroBuffalo}
                    alt="Buffalo"
                    className="h-72 w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="flex items-center justify-between bg-white px-4 py-3">
                    <span className="font-display text-sm font-700 text-earth-700">
                      🐃 Buffalo
                    </span>
                    <span className="text-xs font-600 text-earth-500">Class 1</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 flex h-20 w-20 rotate-6 items-center justify-center rounded-2xl bg-white shadow-card">
                <Brain className="h-9 w-9 text-brand-600" strokeWidth={1.6} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="container-page py-12">
        <div className="card-soft px-6 py-8 sm:px-10">
          <p className="input-label text-center">Classification Workflow</p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-1 items-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
                      <Icon className="h-5.5 w-5.5" strokeWidth={1.8} />
                    </span>
                    <span className="text-xs font-600 text-brand-700">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden flex-1 border-t-2 border-dashed border-brand-200 sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-12">
        <div className="mb-10 text-center">
          <p className="input-label">Why this isn't a mock</p>
          <h2 className="mt-2 font-display text-3xl font-800 tracking-tight text-brand-950">
            A real ML system, end to end
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-600">
            Every prediction passes through a trained MobileNetV2 feature
            extractor and a real classification head — not random labels or
            filename heuristics.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-6 transition-all hover:shadow-glow">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 font-display text-lg font-700 text-brand-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-600">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-8 py-14 text-center shadow-card sm:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(143,197,158,0.4), transparent 40%), radial-gradient(circle at 80% 80%, rgba(156,116,80,0.4), transparent 40%)',
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-800 tracking-tight text-white sm:text-4xl">
              Try it on your own image
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-brand-100/80">
              Drag and drop a photo of a cow or buffalo and watch the model
              classify it in real time.
            </p>
            <Link
              to="/classify"
              className="btn mt-7 bg-white text-brand-800 hover:bg-brand-50"
            >
              Start Classifying
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import {
  Upload,
  ScanLine,
  Brain,
  Cpu,
  CheckCircle2,
  Layers,
  LineChart,
  Code2,
  Database,
  Server,
  Zap,
} from 'lucide-react';

const techGroups = [
  {
    category: 'Frontend',
    items: [
      { name: 'React 18', icon: Code2 },
      { name: 'Vite 7', icon: Zap },
      { name: 'TypeScript', icon: Code2 },
      { name: 'Tailwind CSS', icon: Code2 },
      { name: 'React Router', icon: Code2 },
      { name: 'Recharts', icon: LineChart },
      { name: 'Lucide Icons', icon: Code2 },
    ],
  },
  {
    category: 'In-Browser ML',
    items: [
      { name: 'TensorFlow.js', icon: Brain },
      { name: 'MobileNetV2', icon: Cpu },
      { name: '@tensorflow-models/mobilenet', icon: Cpu },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'FastAPI', icon: Server },
      { name: 'Uvicorn', icon: Server },
      { name: 'Python Multipart', icon: Server },
    ],
  },
  {
    category: 'Python ML Pipeline',
    items: [
      { name: 'TensorFlow 2.16', icon: Brain },
      { name: 'Keras', icon: Brain },
      { name: 'NumPy', icon: Cpu },
      { name: 'Pillow (PIL)', icon: Code2 },
      { name: 'scikit-learn', icon: LineChart },
      { name: 'TensorFlow.js Converter', icon: Zap },
    ],
  },
  {
    category: 'Database',
    items: [
      { name: 'Supabase (PostgreSQL)', icon: Database },
      { name: 'Row Level Security', icon: Database },
    ],
  },
];

const workflow = [
  { icon: Upload, label: 'Image Upload' },
  { icon: ScanLine, label: 'Preprocessing' },
  { icon: Brain, label: 'Feature Extraction' },
  { icon: Cpu, label: 'Deep Learning Model' },
  { icon: Layers, label: 'Classification' },
  { icon: LineChart, label: 'Confidence Score' },
];

export default function About() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl">
        <p className="input-label">About the Project</p>
        <h1 className="mt-2 font-display text-3xl font-800 tracking-tight text-brand-950 sm:text-4xl">
          AI-Based Cattle &amp; Buffalo Classification
        </h1>

        <div className="mt-8 space-y-8">
          {/* Topic */}
          <Section title="Project Topic">
            <p className="font-600 text-brand-900">
              Image-Based Animal Type Classification for Cattle and Buffaloes
            </p>
            <p className="mt-2">
              A complete AI/ML-powered image classification system that allows a
              user to upload an image of an animal and automatically determines
              whether the animal is a Cattle or a Buffalo, using a real trained
              MobileNetV2 transfer-learning model.
            </p>
          </Section>

          <Section title="Problem">
            Manual identification of cattle and buffalo can be time-consuming
            and subjective. In farming, veterinary, and livestock management
            contexts, a reliable automated tool helps speed up record-keeping
            and reduces human error.
          </Section>

          <Section title="Solution">
            An AI-based image classification system automatically analyzes an
            uploaded image and classifies the animal as either cattle or
            buffalo. It reports the predicted class, a confidence score, and
            per-class probabilities (cattle % and buffalo %). Every prediction
            comes from real deep-learning inference — not hardcoded results,
            random guesses, or mock APIs.
          </Section>

          <Section title="What It Shows">
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl bg-cream p-4">
                <p className="font-700 text-brand-900">Classification Result</p>
                <ul className="mt-2 space-y-1.5 text-brand-700">
                  <li>• Predicted animal type (Cattle or Buffalo)</li>
                  <li>• Confidence score as a percentage (e.g., 96.42%)</li>
                  <li>• Per-class probability bars (cattle % and buffalo %)</li>
                  <li>• Confidence level badge: High (≥90%), Moderate (70–89%), Low (&lt;70%)</li>
                  <li>• Inference time in milliseconds</li>
                  <li>• Low-confidence warning for unclear images</li>
                </ul>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <p className="font-700 text-brand-900">Dashboard</p>
                <ul className="mt-2 space-y-1.5 text-brand-700">
                  <li>• Total predictions, cattle count, buffalo count</li>
                  <li>• Average confidence across all predictions</li>
                  <li>• Model accuracy from real evaluation</li>
                  <li>• Cattle vs Buffalo distribution chart</li>
                  <li>• Recent classifications table with thumbnails</li>
                </ul>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <p className="font-700 text-brand-900">Model Performance</p>
                <ul className="mt-2 space-y-1.5 text-brand-700">
                  <li>• Accuracy, Precision, Recall, F1 Score</li>
                  <li>• Confusion matrix visualization</li>
                  <li>• Training accuracy &amp; loss charts</li>
                  <li>• Shows "Model not trained yet" honestly when no evaluation has run</li>
                </ul>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <p className="font-700 text-brand-900">Prediction History</p>
                <ul className="mt-2 space-y-1.5 text-brand-700">
                  <li>• Every prediction saved to Supabase database</li>
                  <li>• Image thumbnail, animal type, confidence, date</li>
                  <li>• Demo vs trained mode indicator per record</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Technology */}
          <Section title="Technology Stack">
            <div className="mt-4 space-y-5">
              {techGroups.map((group) => (
                <div key={group.category}>
                  <p className="input-label mb-2">{group.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <span
                          key={item.name}
                          className="pill border border-black/[0.08] bg-white text-brand-700"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {item.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ML Architecture */}
          <Section title="ML Architecture — MobileNetV2 Transfer Learning">
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-black/[0.05]">
                  {[
                    ['Base Model', 'MobileNetV2 (ImageNet pretrained)'],
                    ['Task', 'Binary Image Classification'],
                    ['Classes', 'Cattle (0), Buffalo (1)'],
                    ['Input Size', '224 × 224 × 3 (RGB)'],
                    ['Feature Embedding', '1280-dimensional'],
                    ['Classification Head', 'Dense(64, ReLU) → Dropout(0.3) → Dense(1, Sigmoid)'],
                    ['Loss Function', 'Binary Cross-Entropy'],
                    ['Optimizer', 'Adam (lr = 1e-3)'],
                    ['Training', '80 epochs in-browser on 48 real images'],
                    ['Framework', 'TensorFlow.js / TensorFlow-Keras'],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-2.5 pr-4 font-600 text-brand-900">{k}</td>
                      <td className="py-2.5 text-brand-700">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Workflow">
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {workflow.map((w, i) => {
                const Icon = w.icon;
                return (
                  <div
                    key={w.label}
                    className="card flex flex-col items-center gap-2 p-4 text-center"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="text-xs font-600 text-brand-700">
                      {i + 1}. {w.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="API Endpoints">
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.08] text-left">
                    <th className="pb-2 font-600 text-brand-500">Endpoint</th>
                    <th className="pb-2 font-600 text-brand-500">Method</th>
                    <th className="pb-2 font-600 text-brand-500">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {[
                    ['/api/predict', 'POST', 'Upload image → real ML prediction'],
                    ['/api/health', 'GET', 'Backend + model status'],
                    ['/api/model-info', 'GET', 'Model architecture details'],
                    ['/api/metrics', 'GET', 'Real evaluation metrics'],
                    ['/api/history', 'GET', 'Prediction history from database'],
                  ].map(([ep, method, purpose]) => (
                    <tr key={ep}>
                      <td className="py-2.5 pr-4 font-mono text-brand-800">{ep}</td>
                      <td className="py-2.5 pr-4">
                        <span className="pill bg-brand-100 text-brand-700">{method}</span>
                      </td>
                      <td className="py-2.5 text-brand-700">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Integrity Commitment">
            <ul className="mt-3 space-y-2.5">
              {[
                'Predictions come from a real ML model — never random, hardcoded, or filename-based.',
                'Confidence scores reflect the model\'s actual sigmoid output, not fabricated numbers.',
                'Accuracy, precision, recall, and F1 are only displayed after a real evaluation run.',
                'When the trained model is not yet connected, the app clearly labels "Demo Mode".',
                'Demo predictions are never mixed with real trained-model predictions.',
              ].map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-brand-700">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Limitations &amp; Future Improvements">
            <ul className="mt-3 list-inside list-disc space-y-2 text-brand-700">
              <li>Binary classification only — an "Unknown" out-of-distribution class is a planned addition.</li>
              <li>Fine-tuned model accuracy improves with a larger, balanced dataset.</li>
              <li>Support for breed-level sub-classification within cattle and buffalo.</li>
              <li>On-device fine-tuning from user-corrected samples.</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-700 text-brand-900">{title}</h2>
      <div className="mt-2 text-brand-700">{children}</div>
    </div>
  );
}

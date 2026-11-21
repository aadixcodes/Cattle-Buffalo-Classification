import { Loader2, Scan, Brain, Calculator } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  { icon: Scan, label: 'Preprocessing image' },
  { icon: Brain, label: 'Running AI model' },
  { icon: Calculator, label: 'Calculating prediction' },
];

export default function AnalyzingState() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % steps.length);
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="animate-fade-in card flex flex-col items-center gap-6 px-8 py-12">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-brand-200/60 animate-pulse-ring" />
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow">
          <Brain className="h-9 w-9 animate-spin-slow" strokeWidth={1.8} />
        </span>
      </div>
      <p className="font-display text-lg font-700 text-brand-900">
        Analyzing image...
      </p>
      <div className="flex w-full max-w-sm flex-col gap-2.5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i < active;
          const current = i === active;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-600 transition-all duration-300 ${
                current
                  ? 'bg-brand-50 text-brand-800'
                  : done
                  ? 'text-brand-600'
                  : 'text-brand-400'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  current
                    ? 'bg-brand-600 text-white'
                    : done
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-black/[0.04] text-brand-400'
                }`}
              >
                {current ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </span>
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

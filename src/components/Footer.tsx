import { Link } from 'react-router-dom';
import { Brain, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-black/[0.06] bg-white/60">
      <div className="container-page py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Brain className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-sm font-700 text-brand-900">
              CattleBuffalo AI
            </span>
          </Link>
          <p className="max-w-md text-xs leading-relaxed text-brand-600/80">
            AI-powered image classification for cattle and buffalo, built on
            MobileNetV2 transfer learning. Predictions come from a real ML model
            running in your browser.
          </p>
          <div className="flex items-center gap-3 text-brand-500">
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.06] bg-white text-brand-700 hover:bg-brand-50"
              aria-label="Source"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-black/[0.05] pt-5 text-xs text-brand-500/70">
          © {new Date().getFullYear()} CattleBuffalo AI · Built with TensorFlow.js, FastAPI &amp; Supabase
        </div>
      </div>
    </footer>
  );
}

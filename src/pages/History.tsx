import { useEffect, useState } from 'react';
import { getRecentPredictions } from '@/lib/history';
import type { PredictionRecord } from '@/lib/types';
import { formatDate } from '@/lib/config';
import DemoModeBadge from '@/components/DemoModeBadge';
import { Link } from 'react-router-dom';
import { Trash2, ImageOff, Clock, ArrowRight } from 'lucide-react';

export default function History() {
  const [rows, setRows] = useState<PredictionRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentPredictions(100)
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <p className="input-label">Prediction History</p>
        <h1 className="mt-2 font-display text-3xl font-800 tracking-tight text-brand-950 sm:text-4xl">
          All Classifications
        </h1>
        <p className="mt-3 text-brand-600">
          Every classification made through the app is recorded here.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-brand-500">Loading history...</div>
      ) : !rows || rows.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <ImageOff className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-display text-xl font-700 text-brand-900">
            No history yet
          </h2>
          <p className="mt-2 text-brand-600">
            Classifications you run will appear here automatically.
          </p>
          <Link to="/classify" className="btn-primary mt-6">
            Classify an Image
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream">
                <tr className="text-left">
                  <th className="px-5 py-4 font-600 text-brand-500">Image</th>
                  <th className="px-5 py-4 font-600 text-brand-500">Animal</th>
                  <th className="px-5 py-4 font-600 text-brand-500">Confidence</th>
                  <th className="px-5 py-4 font-600 text-brand-500">Level</th>
                  <th className="px-5 py-4 font-600 text-brand-500">Mode</th>
                  <th className="px-5 py-4 font-600 text-brand-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-black/[0.05] transition-colors hover:bg-cream/60"
                  >
                    <td className="px-5 py-4">
                      {r.image_thumb ? (
                        <img
                          src={r.image_thumb}
                          alt={r.prediction}
                          className="h-12 w-12 rounded-xl object-cover ring-1 ring-black/[0.06]"
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream text-xl">
                          {r.prediction === 'Buffalo' ? '🐃' : '🐄'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 font-700 text-brand-900">
                        {r.prediction === 'Buffalo' ? '🐃' : '🐄'}
                        {r.prediction}
                      </span>
                    </td>
                    <td className="px-5 py-4 tabular-nums font-600 text-brand-700">
                      {Number(r.confidence).toFixed(2)}%
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`pill border ${
                          r.confidence_level === 'High'
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : r.confidence_level === 'Moderate'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {r.confidence_level}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {r.is_demo ? <DemoModeBadge /> : (
                        <span className="pill border border-brand-200 bg-white text-brand-700">
                          Trained
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-brand-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(r.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

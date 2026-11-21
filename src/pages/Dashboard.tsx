import { useEffect, useState } from 'react';
import {
  getDashboardStats,
} from '@/lib/history';
import type { PredictionRecord } from '@/lib/types';
import MetricCard from '@/components/MetricCard';
import { formatDate } from '@/lib/config';
import {
  Layers,
  Beef as CowIcon,
  Wind,
  Gauge,
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { loadMetrics } from '@/lib/metrics';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface Stats {
  total: number;
  cattle: number;
  buffalo: number;
  avgConfidence: number;
  recent: PredictionRecord[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), loadMetrics()])
      .then(([s, m]) => {
        setStats(s);
        setAccuracy(m.hasMetrics ? m.accuracy : null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="container-page py-20 text-center text-brand-500">
        Loading dashboard...
      </div>
    );
  }

  const distributionData = [
    { name: 'Cattle', value: stats.cattle, fill: '#2c6f47' },
    { name: 'Buffalo', value: stats.buffalo, fill: '#9c7450' },
  ];

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <p className="input-label">AI Classification Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-800 tracking-tight text-brand-950 sm:text-4xl">
          Overview
        </h1>
        <p className="mt-3 text-brand-600">
          Live aggregates from all classifications saved to the database.
        </p>
      </div>

      {stats.total === 0 ? (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <TrendingUp className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-display text-xl font-700 text-brand-900">
            No classifications yet
          </h2>
          <p className="mt-2 text-brand-600">
            Classify your first image to start populating this dashboard.
          </p>
          <Link to="/classify" className="btn-primary mt-6">
            Classify an Image
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Predictions"
              value={stats.total.toLocaleString()}
              icon={<Layers className="h-4.5 w-4.5" />}
              accent="brand"
            />
            <MetricCard
              label="Cattle"
              value={stats.cattle.toLocaleString()}
              icon={<CowIcon className="h-4.5 w-4.5" />}
              accent="brand"
            />
            <MetricCard
              label="Buffalo"
              value={stats.buffalo.toLocaleString()}
              icon={<Wind className="h-4.5 w-4.5" />}
              accent="earth"
            />
            <MetricCard
              label="Avg Confidence"
              value={`${stats.avgConfidence.toFixed(1)}%`}
              icon={<Gauge className="h-4.5 w-4.5" />}
              accent="sky"
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Model Accuracy"
              value={accuracy != null ? `${(accuracy * 100).toFixed(1)}%` : '—'}
              icon={<Target className="h-4.5 w-4.5" />}
              accent="amber"
              hint={accuracy != null ? 'From real evaluation' : 'Not trained yet'}
            />
            <div className="card p-5 sm:col-span-1 lg:col-span-3">
              <p className="input-label mb-3">Cattle vs Buffalo</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="rgba(16,32,24,0.4)" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="rgba(16,32,24,0.4)" width={60} />
                    <Tooltip cursor={{ fill: 'rgba(16,32,24,0.04)' }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {distributionData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-8 card p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="input-label">Recent Classifications</p>
              <Link to="/history" className="text-sm font-600 text-brand-700 hover:text-brand-900">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] text-left">
                    <th className="pb-3 font-600 text-brand-500">Image</th>
                    <th className="pb-3 font-600 text-brand-500">Animal</th>
                    <th className="pb-3 font-600 text-brand-500">Confidence</th>
                    <th className="pb-3 font-600 text-brand-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((r) => (
                    <tr key={r.id} className="border-b border-black/[0.04] last:border-0">
                      <td className="py-3">
                        {r.image_thumb ? (
                          <img
                            src={r.image_thumb}
                            alt={r.prediction}
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-cream text-lg">
                            {r.prediction === 'Buffalo' ? '🐃' : '🐄'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-600 text-brand-900">{r.prediction}</td>
                      <td className="py-3 tabular-nums text-brand-700">
                        {Number(r.confidence).toFixed(2)}%
                      </td>
                      <td className="py-3 text-brand-500">
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
        </>
      )}
    </div>
  );
}

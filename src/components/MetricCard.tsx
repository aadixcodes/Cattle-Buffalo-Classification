interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: 'brand' | 'earth' | 'amber' | 'sky';
}

const accents: Record<string, string> = {
  brand: 'text-brand-600 bg-brand-50',
  earth: 'text-earth-600 bg-earth-50',
  amber: 'text-amber-600 bg-amber-50',
  sky: 'text-sky-600 bg-sky-50',
};

export default function MetricCard({
  label,
  value,
  hint,
  icon,
  accent = 'brand',
}: MetricCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="input-label">{label}</p>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-800 tabular-nums text-brand-900">
        {value}
      </p>
      {hint && <p className="text-xs text-brand-500">{hint}</p>}
    </div>
  );
}

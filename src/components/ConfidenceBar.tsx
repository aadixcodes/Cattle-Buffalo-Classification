interface ConfidenceBarProps {
  label: string;
  value: number; // 0–100
  color?: 'brand' | 'earth';
  icon?: string;
}

export default function ConfidenceBar({
  label,
  value,
  color = 'brand',
  icon,
}: ConfidenceBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  const barColor =
    color === 'earth'
      ? 'bg-earth-500'
      : 'bg-brand-500';
  const trackColor =
    color === 'earth' ? 'bg-earth-100' : 'bg-brand-100';
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 shrink-0 text-sm font-600 text-brand-800">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </div>
      <div className={`relative h-2.5 flex-1 overflow-hidden rounded-full ${trackColor}`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-16 shrink-0 text-right text-sm font-700 tabular-nums text-brand-900">
        {pct.toFixed(2)}%
      </div>
    </div>
  );
}

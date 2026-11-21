import { Info } from 'lucide-react';

export default function DemoModeBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`pill border border-amber-300 bg-amber-50 text-amber-700 ${className}`}
    >
      <Info className="h-3.5 w-3.5" />
      Demo Mode
    </span>
  );
}

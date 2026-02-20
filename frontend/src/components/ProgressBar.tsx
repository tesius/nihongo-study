interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-muted">{label}</span>
          <span className="text-text-muted">
            {current}/{total} ({pct}%)
          </span>
        </div>
      )}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

import { cn } from "../lib/cn";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

/** Thin track (--surface-2) with an accent fill (DESIGN.md §ProgressBar). */
export function ProgressBar({ value, max, className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

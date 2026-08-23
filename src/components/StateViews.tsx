import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";
import { Button } from "./Button";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent",
        className,
      )}
    />
  );
}

/** Skeleton placeholder bars for pending content. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl bg-surface"
        />
      ))}
    </div>
  );
}

export function ErrorCard({ onRetry }: { onRetry?: () => void }) {
  const { c, t } = useT();
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-center">
      <p className="text-text-muted">{t.error.generic}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          {c.common.retry}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-12 text-center">
      {icon && <div className="text-text-muted">{icon}</div>}
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-text-muted">{hint}</p>}
    </div>
  );
}

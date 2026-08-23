import { ArrowRight } from "lucide-react";
import { useT } from "../i18n/useT";

/** Bottom-of-lesson "up next" card (DESIGN.md §NextCard). */
export function NextCard({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="elev flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors duration-150 hover:bg-surface-2"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium uppercase tracking-wide text-text-muted">
          {t.lesson.next}
        </p>
        <p className="mt-0.5 truncate font-medium text-text">{title}</p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-accent" />
    </button>
  );
}

import { Fragment, type ReactNode } from "react";
import { cn } from "../lib/cn";

/** Dot-separated meta line (DESIGN.md §Meta row):
 *  `N уроков · M тестов · Free|N ⭐ · Сертификат`. Falsy items are dropped. */
export function MetaRow({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  const parts = items.filter((item): item is ReactNode => Boolean(item));
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-medium text-text-muted",
        className,
      )}
    >
      {parts.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden className="text-text-faint">·</span>}
          <span className="inline-flex items-center gap-1">{item}</span>
        </Fragment>
      ))}
    </div>
  );
}

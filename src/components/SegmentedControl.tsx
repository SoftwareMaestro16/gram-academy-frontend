import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { selectionHaptic } from "../lib/telegram";

export interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
}

/** Pill segmented control (DESIGN.md §SegmentedControl) — locale + theme. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 rounded-full border border-border bg-surface-2 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => {
              if (!active) {
                selectionHaptic();
                onChange(option.value);
              }
            }}
            className={cn(
              "min-h-[36px] flex-1 rounded-full px-3 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

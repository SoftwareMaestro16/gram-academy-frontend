import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface CardProps {
  children: ReactNode;
  /** Renders as a button with a hover/press tint (DESIGN.md §Card). */
  onClick?: () => void;
  /** Featured cards use an accent-soft background. */
  featured?: boolean;
  className?: string;
}

/** Surface card: 1px border, rounded-2xl (--r-lg), padding 16, soft shadow in
 *  light (none in dark, via `.elev`). Tapable cards tint on hover/press. */
export function Card({ children, onClick, featured, className }: CardProps) {
  const base = cn(
    "elev rounded-2xl border border-border p-4 text-left",
    featured ? "bg-accent-soft" : "bg-surface",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          base,
          "w-full transition-colors duration-150 hover:bg-surface-2 active:bg-surface-2",
        )}
      >
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}

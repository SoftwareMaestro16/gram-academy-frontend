import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type Tone = "neutral" | "success" | "accent" | "muted";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-text-muted",
  success: "bg-success-soft text-success",
  accent: "bg-accent-soft text-accent",
  muted: "bg-surface-2 text-text-faint",
};

/** Small pill. States per DESIGN.md §Badge (completed/minted/passed/meta). */
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "../lib/cn";

/** Academy wordmark — white on dark, black on light (swapped via CSS). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="Gram Academy">
      <img
        src="/academy_black.png"
        alt="Gram Academy"
        className="theme-light-only h-7 w-auto"
      />
      <img
        src="/academy_white.png"
        alt="Gram Academy"
        className="theme-dark-only h-7 w-auto"
      />
    </span>
  );
}

/** "Built on TON" attribution — the official TON logo, never recolored
 *  (assets/README.md): white variant on dark, dark variant on light.
 *  `className` sizes the mark itself (e.g. "h-5") — merged onto both theme
 *  variants via `cn`, so callers can size up without a wrapper transform. */
export function TonAttribution({ className }: { className?: string }) {
  return (
    <span className="inline-flex items-center" aria-label="Built on TON">
      <img
        src="/ton-color.svg"
        alt="TON"
        className={cn("theme-light-only h-4 w-auto", className)}
      />
      <img
        src="/ton-white.svg"
        alt="TON"
        className={cn("theme-dark-only h-4 w-auto", className)}
      />
    </span>
  );
}

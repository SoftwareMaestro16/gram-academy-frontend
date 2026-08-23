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
 *  (assets/README.md): white variant on dark, dark variant on light. */
export function TonAttribution({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="Built on TON">
      <img src="/ton-color.svg" alt="TON" className="theme-light-only h-4 w-auto" />
      <img src="/ton-white.svg" alt="TON" className="theme-dark-only h-4 w-auto" />
    </span>
  );
}

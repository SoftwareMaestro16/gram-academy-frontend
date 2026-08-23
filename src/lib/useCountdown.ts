import { useEffect, useState } from "react";

/**
 * Ticks down to a fixed target timestamp (ms since epoch) at ~4x/second for a
 * smooth display. Returns whole seconds remaining, clamped to >= 0. Pass
 * `null` for "not counting" — always returns 0, no interval runs.
 *
 * Purely cosmetic/UX: any server-authoritative deadline (per-question 30s
 * limit, cooldown) is enforced server-side regardless of what this renders.
 */
export function useCountdownTo(targetMs: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [targetMs]);

  if (targetMs === null) return 0;
  return Math.max(0, Math.ceil((targetMs - now) / 1000));
}

import { useLayoutEffect, useRef } from "react";
import { Logo } from "./Logo";
import { WalletControl } from "./WalletControl";

/**
 * The site Header — a real, persistent top bar rendered once by `AppShell`
 * for every screen (including lesson/quiz, unlike the old TabBar-embedded
 * top nav it replaces), not duplicated per-screen. Just the brand mark and
 * the wallet control — primary navigation lives entirely in `TabBar` (now
 * shown at every breakpoint, not just <600px), so this stays a single slim
 * row that never gets crowded regardless of viewport width.
 *
 * The theme toggle that used to live here was removed — it's still reachable
 * from Profile's language/theme card, so nothing is lost.
 */
export function Header() {
  const ref = useRef<HTMLElement>(null);

  // Publishes the real rendered height as `--header-h` so any sticky bar that
  // needs to sit right below Header (Screen's back-button row) can position
  // itself off the actual box instead of a hardcoded guess — a guess that's
  // wrong whenever the safe-area inset, text wrapping, or the sm:mt-3
  // floating-card margin changes Header's true height, leaving either a gap
  // (content peeking through) or an overlap.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={ref} className="sticky top-0 z-30">
      {/* content-col-width outer carries the safe-area padding AND the background/rounding, so the
       *  notch-safe inset and the header row below it are the same narrow shape (not a full-width
       *  strip sitting above a narrower pill). The row's own height is fixed on the INNER div, not
       *  here — padding-top plus a height on the same box would fight each other under
       *  box-sizing:border-box (the row could get squeezed to nothing on a tall safe-area inset).
       *  At sm: and up (desktop-ish widths — mobile stays flush against the top edge, only the
       *  bottom corners rounded) it also gets a top margin + top rounding, so it reads as a fully
       *  rounded floating card rather than one flush against the viewport's top edge. */}
      <div className="safe-top content-col rounded-b-2xl bg-surface/95 shadow-[0_1px_0_0_var(--border),0_4px_16px_-8px_rgba(0,0,0,0.25)] backdrop-blur sm:mt-3 sm:rounded-t-2xl">
        <div className="flex min-h-11 items-center gap-3 px-3 py-2 xs:px-4 md:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Logo className="shrink-0" />
            <span className="truncate text-base font-semibold text-text sm:text-lg">
              Gram Academy
            </span>
          </div>

          <WalletControl className="ml-auto shrink-0" />
        </div>
      </div>
    </header>
  );
}

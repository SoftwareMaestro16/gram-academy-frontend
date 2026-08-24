import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";

interface ScreenProps {
  title?: string | undefined;
  /** When set, a back chevron is shown (fallback for non-Telegram; the
   *  Telegram BackButton triggers the same handler in-app). Always rendered
   *  regardless of width — desktop has no hardware/OS back affordance
   *  (DESIGN.md §Responsive breakpoints). */
  onBack?: (() => void) | undefined;
  /** Extra element rendered on the right of the header. */
  action?: ReactNode | undefined;
  children: ReactNode;
  /** Reserve space at the bottom for the tab bar (mobile only — the tab bar
   *  becomes a top nav at ≥600px, so no bottom clearance is needed there). */
  withTabBar?: boolean | undefined;
  /** Use the wider `.content-col-lesson` column instead of the standard
   *  `.content-col`. Only the lesson screen needs this — it's the one screen
   *  with a genuine 2-column layout (sidebar + reading content), and the
   *  standard column caps squeeze that reading column below its own
   *  typography target once the sidebar width is subtracted. */
  wide?: boolean | undefined;
}

export function Screen({
  title,
  onBack,
  action,
  children,
  withTabBar,
  wide,
}: ScreenProps) {
  const { c } = useT();
  return (
    <div
      className={cn(
        "flex min-h-full w-full flex-col",
        wide ? "content-col-lesson" : "content-col",
      )}
    >
      {(title || onBack || action) && (
        // Sticks to the top of #scroll-area (App.tsx) — Header itself lives
        // outside that scrolling subtree entirely, so this only ever needs
        // to clear its OWN height, not Header's.
        <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-3 xs:px-4">
            {onBack && (
              <button
                type="button"
                aria-label={c.common.back}
                onClick={onBack}
                className="-ml-2 flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-2 text-text-muted hover:text-text"
              >
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <span className="hidden text-sm font-medium sm:inline">
                  {c.common.back}
                </span>
              </button>
            )}
            {title && (
              <h1 className="truncate text-lg font-semibold">{title}</h1>
            )}
            {action && <div className="ml-auto">{action}</div>}
          </div>
        </header>
      )}
      <main
        className={cn(
          // pt/pb kept separate (not py-*) so the withTabBar bottom-bar
          // clearance below can't be clobbered by a responsive pt/pb pair
          // fighting over the padding-bottom axis.
          "flex-1 px-3 pt-3 xs:px-4 xs:pt-4",
          withTabBar ? "pb-24" : "pb-3 xs:pb-4",
        )}
      >
        {children}
      </main>
    </div>
  );
}

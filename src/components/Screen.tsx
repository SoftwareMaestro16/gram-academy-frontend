import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "../lib/cn";

interface ScreenProps {
  title?: string | undefined;
  /** When set, a back chevron is shown (fallback for non-Telegram; the
   *  Telegram BackButton triggers the same handler in-app). */
  onBack?: (() => void) | undefined;
  /** Extra element rendered on the right of the header. */
  action?: ReactNode | undefined;
  children: ReactNode;
  /** Reserve space at the bottom for the tab bar. */
  withTabBar?: boolean | undefined;
}

export function Screen({
  title,
  onBack,
  action,
  children,
  withTabBar,
}: ScreenProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
      {(title || onBack || action) && (
        <header className="safe-top sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-4">
            {onBack && (
              <button
                type="button"
                aria-label="Back"
                onClick={onBack}
                className="-ml-2 rounded-full p-2 text-text-muted hover:text-text"
              >
                <ChevronLeft className="h-5 w-5" />
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
          "flex-1 px-4 py-4",
          withTabBar && "pb-24",
        )}
      >
        {children}
      </main>
    </div>
  );
}

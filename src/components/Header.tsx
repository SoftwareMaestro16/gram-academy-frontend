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
  return (
    <header className="safe-top sticky top-0 z-30 rounded-b-2xl bg-surface/95 shadow-[0_1px_0_0_var(--border),0_4px_16px_-8px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="content-col flex h-12 items-center gap-3 px-3 xs:px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Logo className="shrink-0" />
          <span className="truncate text-base font-semibold text-text sm:text-lg">
            Gram Academy
          </span>
        </div>

        <WalletControl className="ml-auto shrink-0" />
      </div>
    </header>
  );
}

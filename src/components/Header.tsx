import { House, User } from "lucide-react";
import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";
import { useAppStore, type AppView, type RootTab } from "../state/useAppStore";
import { selectionHaptic } from "../lib/telegram";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/** Maps any view to the root tab it belongs under. */
function tabForView(view: AppView): RootTab {
  return view.name === "profile" ? "profile" : "home";
}

/**
 * The site Header — a real, persistent top bar rendered once by `AppShell`
 * for every screen (including lesson/quiz, unlike the old TabBar-embedded
 * top nav it replaces), not duplicated per-screen.
 *
 * <600px: minimal — logo + theme toggle only. Primary nav stays in the
 * bottom TabBar so it isn't shown twice.
 * ≥600px: logo + primary nav (Home/Profile) + theme toggle, as a slim
 * sticky bar (the bottom TabBar hides itself at that width instead).
 */
export function Header() {
  const { c } = useT();
  const view = useAppStore((s) => s.view);
  const setTab = useAppStore((s) => s.setTab);
  const active = tabForView(view);

  const tabs: { id: RootTab; label: string; Icon: typeof House }[] = [
    { id: "home", label: c.nav.home, Icon: House },
    { id: "profile", label: c.nav.profile, Icon: User },
  ];

  const onSelect = (id: RootTab) => {
    if (active !== id) selectionHaptic();
    setTab(id);
  };

  return (
    <header className="safe-top sticky top-0 z-30 rounded-b-2xl bg-surface/95 shadow-[0_1px_0_0_var(--border),0_4px_16px_-8px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="content-col flex h-14 items-center gap-3 px-3 xs:px-4 sm:gap-6 md:px-6 lg:px-8">
        <Logo className="shrink-0" />

        {/* ≥600px only: primary nav lives here instead of the bottom tab bar. */}
        <nav
          className="hidden items-center gap-1 sm:flex"
          aria-label="Primary"
        >
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors duration-150",
                active === id
                  ? "bg-accent-soft text-accent"
                  : "text-text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <ThemeToggle className="ml-auto shrink-0" />
      </div>
    </header>
  );
}

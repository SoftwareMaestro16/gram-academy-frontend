import { Award, House, User } from "lucide-react";
import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";
import { useAppStore, type AppView, type RootTab } from "../state/useAppStore";
import { selectionHaptic } from "../lib/telegram";

/** Maps any view to the root tab it belongs under. */
function tabForView(view: AppView): RootTab {
  if (view.name === "profile") return "profile";
  if (view.name === "certificates") return "certificates";
  return "home";
}

/**
 * Root Home/Profile nav for narrow layouts (<600px — bottom bars read as
 * native app chrome there). At ≥600px the same Home/Profile nav lives in the
 * persistent `Header` instead (bottom bars read as mobile-only chrome in a
 * desktop browser tab — DESIGN.md §Responsive breakpoints), so this renders
 * nothing there rather than duplicating it.
 */
export function TabBar() {
  const { c, t } = useT();
  const view = useAppStore((s) => s.view);
  const setTab = useAppStore((s) => s.setTab);
  const active = tabForView(view);

  const tabs: { id: RootTab; label: string; Icon: typeof House }[] = [
    { id: "home", label: c.nav.home, Icon: House },
    { id: "certificates", label: t.profile.certificates, Icon: Award },
    { id: "profile", label: c.nav.profile, Icon: User },
  ];

  const onSelect = (id: RootTab) => {
    if (active !== id) selectionHaptic();
    setTab(id);
  };

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur sm:hidden"
    >
      <div className="content-col flex">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors",
              active === id ? "text-accent" : "text-text-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

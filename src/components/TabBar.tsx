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
 * Root Home/Certificates/Profile nav — the only place primary navigation
 * lives, at every breakpoint (the `Header` holds just the brand mark and the
 * wallet control, so it never gets crowded on wide screens). The outer `nav`
 * is only a full-width positioning helper (`fixed inset-x-0 bottom-0`); the
 * actual visible bar (background/border/blur) lives on the inner
 * `content-col` div, so on a wide viewport this reads as a centered floating
 * bar matching the page content's own max-width instead of a full-bleed one.
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
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20">
      {/* One content-col-width element carries both the button row AND the safe-area padding below
       *  it, so the bar and the notch-safe inset (behind a device home indicator) are the same
       *  narrow shape — not a full-width strip under a narrower pill. Safe here (unlike Header's
       *  own padding-vs-height fix) because nothing on this element fixes a total height that the
       *  padding could squeeze; each button sizes itself via `min-h-11`. At sm: and up it also gets
       *  a bottom margin + full border + bottom rounding, matching Header's fully-rounded floating
       *  card at the same breakpoint (mobile stays flush against the bottom edge). */}
      <div className="safe-bottom content-col rounded-t-2xl border-t border-border bg-surface/95 backdrop-blur sm:mb-3 sm:rounded-b-2xl sm:border">

        <div className="flex">
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
      </div>
    </nav>
  );
}

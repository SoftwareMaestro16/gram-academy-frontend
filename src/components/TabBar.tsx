import { House, User } from "lucide-react";
import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";
import { useAppStore, type AppView, type RootTab } from "../state/useAppStore";
import { selectionHaptic } from "../lib/telegram";

/** Maps any view to the root tab it belongs under. */
function tabForView(view: AppView): RootTab {
  return view.name === "profile" ? "profile" : "home";
}

export function TabBar() {
  const { c } = useT();
  const view = useAppStore((s) => s.view);
  const setTab = useAppStore((s) => s.setTab);
  const active = tabForView(view);

  const tabs: { id: RootTab; label: string; Icon: typeof House }[] = [
    { id: "home", label: c.nav.home, Icon: House },
    { id: "profile", label: c.nav.profile, Icon: User },
  ];

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (active !== id) selectionHaptic();
              setTab(id);
            }}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors",
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

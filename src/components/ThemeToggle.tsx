import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { useAppStore } from "../state/useAppStore";
import { useEffectiveTheme } from "../lib/useTheme";
import { selectionHaptic } from "../lib/telegram";

/** Sun/moon theme toggle (DESIGN.md §Theme). Sets a manual override that
 *  persists in the store; the icon shows the theme you'd switch TO. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useEffectiveTheme();
  const setThemeOverride = useAppStore((s) => s.setThemeOverride);
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => {
        selectionHaptic();
        setThemeOverride(theme === "dark" ? "light" : "dark");
      }}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

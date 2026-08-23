import { getTelegramColorScheme } from "./telegram";

export type Theme = "light" | "dark";
/** User's manual choice; `null` = follow Telegram / default. */
export type ThemeOverride = Theme | null;

/**
 * Effective theme (DESIGN.md §Theme): manual override → Telegram colorScheme →
 * default dark.
 */
export function resolveTheme(override: ThemeOverride): Theme {
  if (override === "light" || override === "dark") return override;
  return getTelegramColorScheme() ?? "dark";
}

/** Applies the theme as `data-theme` on <html>. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

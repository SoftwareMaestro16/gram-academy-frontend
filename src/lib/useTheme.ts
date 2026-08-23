import { useAppStore } from "../state/useAppStore";
import { resolveTheme, type Theme } from "./theme";

/** Reactive effective theme (re-renders when the manual override changes). */
export function useEffectiveTheme(): Theme {
  const override = useAppStore((s) => s.themeOverride);
  return resolveTheme(override);
}

import { useAppStore } from "../state/useAppStore";
import { appMessages, screenMessages, type Locale } from "./strings";

/**
 * Current-locale UI strings. `c` = vendored app-shell chrome
 * (`@gram-academy/i18n`); `t` = client-local screen chrome (strings.ts).
 */
export function useT(): {
  locale: Locale;
  c: (typeof appMessages)[Locale];
  t: (typeof screenMessages)[Locale];
} {
  const locale = useAppStore((s) => s.locale);
  return { locale, c: appMessages[locale], t: screenMessages[locale] };
}

import { resolveLocale, appMessages } from "@gram-academy/i18n";

// Placeholder shell — verifies the vendored @gram-academy/i18n resolves.
// Track C replaces this with the auth-gate + Zustand view-stack navigation.
export function App() {
  const locale = resolveLocale(navigator.language);
  return <main>{appMessages[locale].common.loading}</main>;
}

import { subscribeToTelegramInactive } from "./tmaSdk";

/**
 * Fires `onBackground` at most once, the moment the app is backgrounded or
 * hidden: prefers Telegram's own Mini App activity signal (lazy
 * `@tma.js/sdk`, `miniApp.isActive`) and always layers
 * `document.visibilitychange` + `window.blur` as a universal fallback
 * (QUIZ-INTEGRITY.md — used to fail an active quiz attempt via `/violate`).
 *
 * Returns a cleanup function; call it to stop listening entirely (e.g. once
 * the attempt finalizes) — no further calls to `onBackground` happen after.
 */
export function onAppBackgrounded(onBackground: () => void): () => void {
  let fired = false;
  let stopped = false;

  const fireOnce = () => {
    if (fired || stopped) return;
    fired = true;
    onBackground();
  };

  const onDocVisibility = () => {
    if (document.hidden) fireOnce();
  };
  const onBlur = () => fireOnce();

  document.addEventListener("visibilitychange", onDocVisibility);
  window.addEventListener("blur", onBlur);

  let unsubTelegram: (() => void) | null = null;
  void subscribeToTelegramInactive(fireOnce).then((unsub) => {
    if (stopped) {
      unsub();
    } else {
      unsubTelegram = unsub;
    }
  });

  return () => {
    stopped = true;
    document.removeEventListener("visibilitychange", onDocVisibility);
    window.removeEventListener("blur", onBlur);
    unsubTelegram?.();
  };
}

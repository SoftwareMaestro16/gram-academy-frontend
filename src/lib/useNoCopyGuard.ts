import { useEffect } from "react";

const BLOCKED_EVENTS = ["copy", "cut", "contextmenu", "selectstart"] as const;

/**
 * Blocks copy/cut/contextmenu/selectstart while `active` is true
 * (QUIZ-INTEGRITY.md). Deterrent only, not real security. Pair with the
 * `.no-copy` CSS class (styles/app.css) on the protected DOM — this hook only
 * handles the event side. Quiz-screen only; never applied to lessons.
 */
export function useNoCopyGuard(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const block = (event: Event) => event.preventDefault();
    for (const type of BLOCKED_EVENTS) {
      document.addEventListener(type, block);
    }
    return () => {
      for (const type of BLOCKED_EVENTS) {
        document.removeEventListener(type, block);
      }
    };
  }, [active]);
}

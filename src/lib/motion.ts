/**
 * True when the user has requested reduced motion (DESIGN.md §Motion). CSS
 * animations already collapse their own duration via the
 * `prefers-reduced-motion` media query in app.css; this covers the few spots
 * that also delay a state transition in JS purely to let a brief animation
 * play out (e.g. the lesson-complete checkmark before navigating onward),
 * so those users aren't held up by a delay tied to motion they don't see.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

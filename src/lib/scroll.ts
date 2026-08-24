/**
 * The app's one scroll container is `#scroll-area` (App.tsx's AppShell), not
 * the document/window — html/body/#root all have `overflow: hidden`.
 * Header/TabBar live outside #scroll-area entirely, in a non-scrolling
 * "chrome" layer (see the #root comment in app.css for why: a `position:
 * fixed`/`sticky` Header nested inside a scrolling ancestor was observed not
 * staying pinned to the true viewport in a Telegram Desktop WebView).
 * Anything that used to read/set `window.scrollY`/`scrollTo` or listen for
 * the `scroll` event needs to target this element instead.
 */
export function getScrollContainer(): HTMLElement {
  return document.getElementById("scroll-area") ?? document.documentElement;
}

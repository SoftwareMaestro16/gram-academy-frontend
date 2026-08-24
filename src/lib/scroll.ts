/**
 * The app's one scroll container is `#root` (styles/app.css), not the
 * document/window — html/body have `overflow: hidden` to block document-level
 * scroll entirely (a Telegram Desktop WebView showed an elastic overscroll
 * bounce there, briefly revealing scrolled-past content above the sticky
 * Header). Anything that used to read/set `window.scrollY`/`scrollTo` or
 * listen for the `scroll` event needs to target this element instead.
 */
export function getScrollContainer(): HTMLElement {
  return document.getElementById("root") ?? document.documentElement;
}

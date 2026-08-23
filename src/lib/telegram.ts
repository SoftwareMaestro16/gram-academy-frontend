import { resolveLocale, type Locale } from "@gram-academy/i18n";

/**
 * Minimal hand-typed view of `window.Telegram.WebApp` — only the surface the
 * Mini App uses. The full runtime is injected by the `telegram-web-app.js`
 * script (index.html). Wave 2 members (openInvoice/switchInlineQuery) are
 * declared but not yet called.
 */
type HapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotification = "error" | "success" | "warning";

interface TelegramBackButton {
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
}

interface TelegramHaptics {
  impactOccurred: (style: HapticStyle) => void;
  notificationOccurred: (type: HapticNotification) => void;
  selectionChanged: () => void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    start_param?: string;
    user?: { language_code?: string };
  };
  version: string;
  colorScheme: "light" | "dark";
  ready: () => void;
  expand: () => void;
  isVersionAtLeast: (version: string) => boolean;
  requestFullscreen?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  BackButton: TelegramBackButton;
  HapticFeedback: TelegramHaptics;
  onEvent?: (event: string, handler: () => void) => void;
  offEvent?: (event: string, handler: () => void) => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  // Wave 2 (declared, not called yet):
  openInvoice?: (url: string, cb: (status: string) => void) => void;
  switchInlineQuery?: (query: string, chatTypes?: string[]) => void;
}

interface TelegramGlobal {
  Telegram?: { WebApp?: TelegramWebApp };
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as TelegramGlobal).Telegram?.WebApp ?? null;
}

const INIT_DATA_STORAGE_KEY = "gram-academy.initData";

/**
 * Returns the launch `initData` query string, or "" outside Telegram.
 * Falls back to the `tgWebAppData` param in the URL (+ sessionStorage), which
 * survives client-side reloads that drop `window.Telegram.WebApp.initData`.
 */
export function getTelegramInitData(): string {
  const webApp = getTelegramWebApp();
  if (webApp?.initData) return webApp.initData;

  if (typeof window === "undefined") return "";

  const fromUrl = readInitDataFromUrl();
  if (fromUrl) {
    try {
      sessionStorage.setItem(INIT_DATA_STORAGE_KEY, fromUrl);
    } catch {
      /* storage unavailable — ignore */
    }
    return fromUrl;
  }

  try {
    return sessionStorage.getItem(INIT_DATA_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function readInitDataFromUrl(): string {
  const sources = [window.location.hash.replace(/^#/, ""), window.location.search];
  for (const source of sources) {
    if (!source) continue;
    const params = new URLSearchParams(source);
    const raw = params.get("tgWebAppData");
    if (raw) return raw;
  }
  return "";
}

export function isInTelegram(): boolean {
  return getTelegramInitData().length > 0;
}

/** Locale from the Telegram profile language, resolved to en/ru/zh. */
export function getTelegramLocale(): Locale {
  const webApp = getTelegramWebApp();
  return resolveLocale(webApp?.initDataUnsafe.user?.language_code);
}

/** Telegram's current color scheme, or null outside Telegram. */
export function getTelegramColorScheme(): "light" | "dark" | null {
  return getTelegramWebApp()?.colorScheme ?? null;
}

/** Subscribe to Telegram's `themeChanged` event; returns an unsubscribe fn. */
export function onTelegramThemeChanged(handler: () => void): () => void {
  const webApp = getTelegramWebApp();
  if (!webApp?.onEvent) return () => undefined;
  webApp.onEvent("themeChanged", handler);
  return () => webApp.offEvent?.("themeChanged", handler);
}

/**
 * Prompts "Are you sure?" on an accidental swipe-to-close (Bot API 6.2+).
 * Called once at startup, unconditionally — not quiz-specific
 * (QUIZ-INTEGRITY.md §Client requirements). No-ops outside Telegram.
 */
export function enableClosingConfirmation(): void {
  try {
    getTelegramWebApp()?.enableClosingConfirmation?.();
  } catch {
    /* not in Telegram / unsupported — ignore */
  }
}

/**
 * Synchronous boot: ready + expand, and request fullscreen on Telegram ≥ 8.0.
 * The `data-tg-fullscreen-requested` attribute reserves space under Telegram's
 * controls immediately via CSS (styles/app.css) — call before first paint.
 */
export function prepareTelegramViewport(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  try {
    webApp.ready();
    webApp.expand();
    if (webApp.isVersionAtLeast("8.0") && webApp.requestFullscreen) {
      webApp.requestFullscreen();
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-tg-fullscreen-requested", "true");
      }
    }
  } catch {
    /* not in Telegram or unsupported — degrade silently */
  }
}

// --- BackButton ------------------------------------------------------------

let currentBackHandler: (() => void) | null = null;

export function showBackButton(handler: () => void): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  if (currentBackHandler) webApp.BackButton.offClick(currentBackHandler);
  currentBackHandler = handler;
  webApp.BackButton.onClick(handler);
  webApp.BackButton.show();
}

export function hideBackButton(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  if (currentBackHandler) {
    webApp.BackButton.offClick(currentBackHandler);
    currentBackHandler = null;
  }
  webApp.BackButton.hide();
}

// --- Haptics ---------------------------------------------------------------

export function selectionHaptic(): void {
  try {
    getTelegramWebApp()?.HapticFeedback.selectionChanged();
  } catch {
    /* ignore */
  }
}

export function impactHaptic(style: HapticStyle = "medium"): void {
  try {
    getTelegramWebApp()?.HapticFeedback.impactOccurred(style);
  } catch {
    /* ignore */
  }
}

export function notificationHaptic(type: HapticNotification): void {
  try {
    getTelegramWebApp()?.HapticFeedback.notificationOccurred(type);
  } catch {
    /* ignore */
  }
}

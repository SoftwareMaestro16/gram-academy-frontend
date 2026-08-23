/**
 * Lazy `@tma.js/sdk` bring-up: binds Telegram theme params to CSS variables and
 * mounts the viewport. Loaded on demand (frontend-spec §2.3) so the SDK is not
 * in the critical boot path. Everything is feature-detected and wrapped — the
 * concrete viewport/back-button/haptics operations the app relies on go through
 * `window.Telegram.WebApp` (lib/telegram.ts); this only augments theming.
 */
type Fn = () => unknown;

interface TmaLike {
  isTMA?: () => boolean;
  init?: () => unknown;
  themeParams?: { mount?: Fn; bindCssVars?: Fn };
  viewport?: { mount?: Fn; expand?: Fn };
  miniApp?: { mount?: Fn; ready?: Fn };
}

let started = false;

function callSafely(fn: Fn | undefined): void {
  if (typeof fn !== "function") return;
  try {
    const result = fn();
    // Some mount()s return a promise — swallow rejections instead of throwing.
    if (result && typeof (result as PromiseLike<unknown>).then === "function") {
      void (result as Promise<unknown>).catch(() => undefined);
    }
  } catch {
    /* not in Telegram / unsupported — ignore */
  }
}

export async function setupTelegramSdk(): Promise<void> {
  if (started) return;
  started = true;
  try {
    const mod = (await import("@tma.js/sdk-react")) as unknown as TmaLike;

    if (typeof mod.isTMA === "function") {
      let inside = false;
      try {
        inside = mod.isTMA() === true;
      } catch {
        inside = false;
      }
      if (!inside) return;
    }

    callSafely(mod.init);
    callSafely(mod.themeParams?.mount);
    callSafely(mod.themeParams?.bindCssVars);
    callSafely(mod.viewport?.mount);
    callSafely(mod.viewport?.expand);
    callSafely(mod.miniApp?.mount);
    callSafely(mod.miniApp?.ready);
  } catch {
    /* SDK failed to load or init — the app still works via telegram.ts */
  }
}

interface SignalLike<T> {
  (): T;
  sub: (fn: (current: T, previous: T) => void) => () => void;
}

interface TmaVisibilityLike {
  isTMA?: () => boolean;
  miniApp?: { isActive?: SignalLike<boolean> };
}

/**
 * Subscribes to the Telegram Mini App's own activity signal
 * (`miniApp.isActive`, backed by the bridge's `visibility_changed` event) —
 * flips to `false` the moment the user switches away from the Mini App
 * (QUIZ-INTEGRITY.md — used to fail an active quiz attempt). No-ops (returns
 * a noop unsubscribe) outside Telegram or if unsupported.
 *
 * Independent of `setupTelegramSdk`'s own mount attempt: the dynamic import
 * is cached by the module loader, so this resolves near-instantly once the
 * SDK has been loaded once, and works even if that earlier mount failed.
 */
export async function subscribeToTelegramInactive(
  onInactive: () => void,
): Promise<() => void> {
  try {
    const mod = (await import("@tma.js/sdk-react")) as unknown as TmaVisibilityLike;

    if (typeof mod.isTMA === "function" && mod.isTMA() !== true) {
      return () => undefined;
    }

    const isActive = mod.miniApp?.isActive;
    if (!isActive || typeof isActive.sub !== "function") {
      return () => undefined;
    }

    return isActive.sub((current) => {
      if (!current) onInactive();
    });
  } catch {
    return () => undefined;
  }
}

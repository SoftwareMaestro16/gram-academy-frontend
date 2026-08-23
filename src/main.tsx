// browserPolyfills MUST be first: @ton/core and TON Connect read Buffer/global
// during module evaluation, before any component renders.
import "./lib/browserPolyfills";
import "./styles/app.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { TonConnectUIProvider, THEME, type Locales } from "@tonconnect/ui-react";
import { App } from "./App";
import { handleAuthError } from "./api/reauth";
import {
  enableClosingConfirmation,
  getTelegramLocale,
  prepareTelegramViewport,
} from "./lib/telegram";
import { useAppStore } from "./state/useAppStore";
import { applyTheme, resolveTheme } from "./lib/theme";

// Reserve fullscreen space + ready/expand before first paint.
prepareTelegramViewport();

// Global "are you sure?" on swipe-to-close — unconditional, not quiz-specific
// (QUIZ-INTEGRITY.md §Client requirements).
enableClosingConfirmation();

// Apply the resolved theme synchronously (before render) to avoid a flash;
// the store is already hydrated from localStorage at this point.
applyTheme(resolveTheme(useAppStore.getState().themeOverride));

// Assigned below; the cache onError closures read it lazily (after assignment).
let queryClient: QueryClient;
const queryCache = new QueryCache({
  onError: (error) => handleAuthError(error, queryClient),
});
const mutationCache = new MutationCache({
  onError: (error) => handleAuthError(error, queryClient),
});
queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const manifestUrl =
  typeof import.meta.env.VITE_TONCONNECT_MANIFEST_URL === "string" &&
  import.meta.env.VITE_TONCONNECT_MANIFEST_URL.length > 0
    ? import.meta.env.VITE_TONCONNECT_MANIFEST_URL
    : `${window.location.origin}/tonconnect-manifest.json`;

// TON Connect UI ships only en/ru — zh falls back to en (frontend-spec §2.2).
const tonLanguage: Locales = getTelegramLocale() === "ru" ? "ru" : "en";

// After connecting (or after signing the mint/purchase transaction), the wallet app should hand
// control back to this Mini App instead of leaving the user stranded in Tonkeeper/etc.
// `twaReturnUrl` (a Telegram deep link) is what TMA-aware wallets use; `returnStrategy: "back"` is
// the fallback for wallets that aren't.
const twaReturnUrl =
  typeof import.meta.env.VITE_TELEGRAM_BOT_DEEPLINK === "string" &&
  import.meta.env.VITE_TELEGRAM_BOT_DEEPLINK.length > 0
    ? (import.meta.env.VITE_TELEGRAM_BOT_DEEPLINK as `${string}://${string}`)
    : undefined;

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
        uiPreferences={{ theme: THEME.DARK }}
        restoreConnection
        language={tonLanguage}
        actionsConfiguration={{ returnStrategy: "back", ...(twaReturnUrl ? { twaReturnUrl } : {}) }}
      >
        <App />
      </TonConnectUIProvider>
    </QueryClientProvider>
  </StrictMode>,
);

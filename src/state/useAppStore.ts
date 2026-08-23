import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, resolveLocale, type Locale } from "@gram-academy/i18n";
import type { ThemeOverride } from "../lib/theme";

/** Navigation targets. There is no router — screens are a Zustand view-stack
 *  and the Telegram BackButton pops `history` (frontend-spec §3). */
export type AppView =
  | { name: "home" }
  | { name: "section"; sectionSlug: string }
  | { name: "course"; slug: string }
  | { name: "lesson"; courseSlug: string; lessonId: string }
  | { name: "quiz"; courseSlug: string; quizId: string }
  | { name: "profile" };

/** Root tabs shown in the bottom tab bar. */
export type RootTab = "home" | "profile";

interface AppState {
  view: AppView;
  history: AppView[];
  /** Effective UI locale. Server (`MeResponse.user.locale`) is the source of
   *  truth; persisted here so pre-auth chrome renders in the last-used locale. */
  locale: Locale;
  /** Manual theme choice; `null` = follow Telegram / default dark. Persisted. */
  themeOverride: ThemeOverride;
  setView: (view: AppView) => void;
  /** Replace the current view without pushing history (no new back entry).
   *  Used for lesson→lesson stepping so the Telegram BackButton returns to the
   *  course in one hop instead of walking lesson-by-lesson. */
  replaceView: (view: AppView) => void;
  /** Switch a root tab, resetting the navigation stack for that tab. */
  setTab: (tab: RootTab) => void;
  goBack: () => void;
  setLocale: (locale: Locale) => void;
  setThemeOverride: (theme: ThemeOverride) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: { name: "home" },
      history: [],
      locale: resolveLocale(
        typeof navigator !== "undefined" ? navigator.language : DEFAULT_LOCALE,
      ),
      themeOverride: null,
      setView: (view) =>
        set((state) => ({ view, history: [...state.history, state.view] })),
      replaceView: (view) => set({ view }),
      setTab: (tab) =>
        set(() => ({
          view: tab === "home" ? { name: "home" } : { name: "profile" },
          history: [],
        })),
      goBack: () => {
        const { history } = get();
        if (history.length === 0) {
          set({ view: { name: "home" }, history: [] });
          return;
        }
        const previous = history[history.length - 1];
        set({
          view: previous ?? { name: "home" },
          history: history.slice(0, -1),
        });
      },
      setLocale: (locale) => set({ locale }),
      setThemeOverride: (themeOverride) => set({ themeOverride }),
    }),
    {
      name: "gram-academy.app",
      // Persist ONLY locale + theme override, never navigation state (spec §3).
      partialize: (state) => ({
        locale: state.locale,
        themeOverride: state.themeOverride,
      }),
    },
  ),
);

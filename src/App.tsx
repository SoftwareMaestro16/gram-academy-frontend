import { useEffect, useMemo, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "./components/Button";
import { ErrorCard, Spinner } from "./components/StateViews";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { TabBar } from "./components/TabBar";
import { HomeScreen } from "./features/home/HomeScreen";
import { LearningScreen } from "./features/learning/LearningScreen";
import { SectionScreen } from "./features/section/SectionScreen";
import { CourseScreen } from "./features/course/CourseScreen";
import { LessonScreen } from "./features/lesson/LessonScreen";
import { QuizScreen } from "./features/quiz/QuizScreen";
import { CertificatesScreen } from "./features/certificates/CertificatesScreen";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import { useAuthTelegramMutation } from "./api/queries";
import { useAppStore, type AppView } from "./state/useAppStore";
import { useT } from "./i18n/useT";
import {
  getTelegramInitData,
  hideBackButton,
  onTelegramThemeChanged,
  showBackButton,
} from "./lib/telegram";
import { setupTelegramSdk } from "./lib/tmaSdk";
import { applyTheme, resolveTheme } from "./lib/theme";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

/** Shown when the app is opened outside Telegram (no initData). */
function OutsideTelegram() {
  const { t } = useT();
  const botLink =
    typeof import.meta.env.VITE_TELEGRAM_BOT_DEEPLINK === "string"
      ? import.meta.env.VITE_TELEGRAM_BOT_DEEPLINK
      : "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <Send className="h-12 w-12 text-accent" />
      <h1 className="text-xl font-bold">{t.outside.title}</h1>
      <p className="text-text-muted">{t.outside.body}</p>
      {botLink ? (
        <a href={botLink} target="_blank" rel="noreferrer">
          <Button variant="primary" size="lg">
            {t.outside.button}
          </Button>
        </a>
      ) : (
        <Button variant="primary" size="lg" disabled>
          {t.outside.button}
        </Button>
      )}
    </div>
  );
}

function renderView(view: AppView) {
  switch (view.name) {
    case "home":
      return <HomeScreen />;
    case "learning":
      return <LearningScreen />;
    case "section":
      return <SectionScreen sectionSlug={view.sectionSlug} />;
    case "course":
      return <CourseScreen slug={view.slug} />;
    case "lesson":
      return (
        <LessonScreen courseSlug={view.courseSlug} lessonId={view.lessonId} />
      );
    case "quiz":
      return <QuizScreen courseSlug={view.courseSlug} quizId={view.quizId} />;
    case "certificates":
      return <CertificatesScreen />;
    case "profile":
      return <ProfileScreen />;
  }
}

/** The authenticated app: view router + Telegram BackButton + tab bar. */
function AppShell() {
  const view = useAppStore((s) => s.view);
  const goBack = useAppStore((s) => s.goBack);

  useEffect(() => {
    const isRoot =
      view.name === "home" ||
      view.name === "learning" ||
      view.name === "certificates" ||
      view.name === "profile";
    if (isRoot) {
      hideBackButton();
    } else {
      showBackButton(goBack);
    }
  }, [view, goBack]);

  // The mobile bottom TabBar (and the bottom clearance Footer reserves for
  // it) stays hidden during lesson/quiz for a distraction-free reading/quiz
  // surface — unchanged from before. The Header, however, is now genuinely
  // persistent: it renders on every screen at every breakpoint.
  const hideBottomTabBar = view.name === "lesson" || view.name === "quiz";

  return (
    // h-dvh + overflow-hidden: this outer column is NOT itself scrollable —
    // Header and TabBar live here, in normal flow, never inside a scrolling
    // container (see the #root comment in app.css for why that matters).
    // #scroll-area below is the one part of this that actually scrolls.
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <div id="scroll-area" className="flex-1">
        {/* min-h-full (not min-h-dvh): #scroll-area's own height is set by
           flexbox (flex-1 in a height:100dvh parent) — a definite, reliably
           computed value, not the multi-level %-through-document-flow chain
           that was fragile in Telegram's WebView host before (html/body/#root
           not resolving). A single min-height:100% against ONE flex-sized
           ancestor pins Footer to the viewport bottom on short pages exactly
           (verified with a scratch repro), unlike min-h-dvh here, which
           overshoots #scroll-area's real height by Header's own height. */}
        <div className="flex min-h-full flex-col">
          <div className="flex flex-1 flex-col">{renderView(view)}</div>
          <Footer withTabBar={!hideBottomTabBar} />
        </div>
      </div>
      {/* TabBar's bottom bar is `fixed`, so its DOM position is independent
       *  of the flow above — safe to render last. */}
      {!hideBottomTabBar && <TabBar />}
    </div>
  );
}

/** Runs initData auth once, then renders the app (or loading/error). */
function AuthGate() {
  const auth = useAuthTelegramMutation();
  const setLocale = useAppStore((s) => s.setLocale);
  const setView = useAppStore((s) => s.setView);
  const started = useRef(false);
  const didNavigate = useRef(false);

  // Re-reads initData fresh on every call (initial mount AND retry) instead of
  // closing over one snapshot — some Telegram clients don't re-mint
  // `auth_date` on an in-app reload, so a failed (expired) attempt retried
  // with the exact same string was guaranteed to fail again forever.
  const authenticate = () => {
    auth.mutate(getTelegramInitData(), {
      onSuccess: (me) => {
        setLocale(me.user.locale);
        if (me.deepLinkCourseSlug && !didNavigate.current) {
          didNavigate.current = true;
          setView({ name: "course", slug: me.deepLinkCourseSlug });
        }
      },
    });
  };

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      authenticate();
    }
    void setupTelegramSdk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (auth.isSuccess) return <AppShell />;
  if (auth.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <ErrorCard
            onRetry={() => {
              auth.reset();
              authenticate();
            }}
          />
        </div>
      </div>
    );
  }
  return <FullScreenLoader />;
}

export function App() {
  const themeOverride = useAppStore((s) => s.themeOverride);

  // Keep <html data-theme> in sync with the manual override…
  useEffect(() => {
    applyTheme(resolveTheme(themeOverride));
  }, [themeOverride]);

  // …and follow Telegram's theme when there is no manual override.
  useEffect(
    () =>
      onTelegramThemeChanged(() =>
        applyTheme(resolveTheme(useAppStore.getState().themeOverride)),
      ),
    [],
  );

  const initData = useMemo(() => getTelegramInitData(), []);
  if (!initData) return <OutsideTelegram />;
  return <AuthGate />;
}

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListTree,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { LessonMarkdown } from "./LessonMarkdown";
import { RoadmapList } from "../../components/RoadmapList";
import { ErrorCard, SkeletonList, Spinner } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useCompleteLessonMutation, useCourseQuery } from "../../api/queries";
import { useLessonFeedbackMutation } from "../../api/engagement";
import { useAppStore } from "../../state/useAppStore";
import { cn } from "../../lib/cn";
import { notificationHaptic, selectionHaptic } from "../../lib/telegram";
import { prefersReducedMotion } from "../../lib/motion";
import { parseLessonBody, sectionDomId, type LessonSection } from "./lessonSections";
import { getScrollContainer } from "../../lib/scroll";

// Indent the in-lesson "On this page" list by heading depth so nested sections
// read as a small outline.
const INDENT_BY_LEVEL: Record<number, string> = {
  1: "pl-3",
  2: "pl-3",
  3: "pl-6",
  4: "pl-9",
  5: "pl-9",
  6: "pl-9",
};

function scrollToSection(id: string) {
  const el = document.getElementById(sectionDomId(id));
  el?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

/** Tracks which in-lesson section is currently in view as the reader scrolls,
 *  so "On this page" can highlight it (screenshot reference: a left accent
 *  bar + accent text on the active entry). Uses an IntersectionObserver with
 *  a thin activation line near the top of the viewport — a section becomes
 *  active once its heading crosses that line, matching the `scroll-mt-32`
 *  offset the jump-to-section behavior already uses. Re-runs whenever the
 *  lesson changes (new section ids -> new DOM nodes to observe). */
function useActiveSectionId(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setActiveId(sectionIds[0] ?? null);
    if (sectionIds.length === 0) return;

    const idByDomId = new Map(sectionIds.map((id) => [sectionDomId(id), id]));
    const elements = sectionIds
      .map((id) => document.getElementById(sectionDomId(id)))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Multiple sections can cross the activation line in one frame (fast
        // scroll/jump); prefer the one closest to the top of the viewport so
        // the highlight matches what the reader is actually looking at.
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = intersecting[0];
        if (top) {
          const id = idByDomId.get(top.target.id);
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-112px 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));

    // A short final section can sit at the bottom of the page without ever
    // crossing the activation line above — once the page hits (or nears) its
    // max scroll, the observer simply has nothing left to fire on, so the
    // previous section stays highlighted forever. Force the last section
    // active once the reader has scrolled essentially to the bottom.
    const lastId = sectionIds[sectionIds.length - 1];
    const scrollEl = getScrollContainer();
    const handleScroll = () => {
      const scrolledToBottom =
        scrollEl.clientHeight + scrollEl.scrollTop >= scrollEl.scrollHeight - 24;
      if (scrolledToBottom && lastId) setActiveId(lastId);
    };
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      scrollEl.removeEventListener("scroll", handleScroll);
    };
  }, [sectionIds]);

  return activeId;
}

/** In-lesson section jump list ("On this page"), derived from the body's
 *  headings. Generic — works for any lesson. Highlights the section currently
 *  in view via `activeId`. */
function OnThisPage({
  sections,
  activeId,
  onJump,
}: {
  sections: LessonSection[];
  activeId: string | null;
  onJump: (id: string) => void;
}) {
  return (
    <nav className="space-y-0.5 border-l border-border">
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => onJump(section.id)}
            className={cn(
              "-ml-px block min-h-9 w-full truncate border-l-2 py-1.5 pr-3 text-left text-sm transition-colors duration-150",
              active
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:bg-surface-2 hover:text-text",
              INDENT_BY_LEVEL[section.level] ?? "pl-3",
            )}
          >
            {section.title}
          </button>
        );
      })}
    </nav>
  );
}

function FeedbackButton({
  active,
  onClick,
  icon,
  label,
  edge,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  /** Screen-reader-only — the rectangle shows icons alone, no visible text. */
  label: string;
  edge: "left" | "right";
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex min-h-11 flex-1 items-center justify-center transition-colors duration-150",
        edge === "left" ? "rounded-l-xl" : "rounded-r-xl",
        active ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {icon}
    </button>
  );
}

/** "Was this helpful?" — persists via POST /v1/lessons/:id/feedback, reflecting
 *  the caller's prior pick from `LessonDetail.feedbackHelpful`. Best-effort: the
 *  endpoint may 404 before the backend ships, so failures are swallowed and the
 *  optimistic local pick stays (we just don't confirm it). */
function WasThisHelpful({
  lessonId,
  courseSlug,
  initial,
}: {
  lessonId: string;
  courseSlug: string;
  initial: boolean | null;
}) {
  const { t } = useT();
  const mutation = useLessonFeedbackMutation();
  const [choice, setChoice] = useState<boolean | null>(initial);

  // Re-sync when navigating to another lesson, or when the server value lands.
  useEffect(() => {
    setChoice(initial);
  }, [lessonId, initial]);

  const choose = (helpful: boolean) => {
    if (choice === helpful) return;
    setChoice(helpful);
    selectionHaptic();
    mutation.mutate({ lessonId, courseSlug, helpful }, { onError: () => undefined });
  };

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-text-muted">{t.lesson.helpfulQuestion}</p>
      <div className="flex w-28 divide-x divide-border overflow-hidden rounded-xl border border-border bg-surface">
        <FeedbackButton
          active={choice === true}
          onClick={() => choose(true)}
          icon={<ThumbsUp className="h-4 w-4" />}
          label={t.lesson.helpfulYes}
          edge="left"
        />
        <FeedbackButton
          active={choice === false}
          onClick={() => choose(false)}
          icon={<ThumbsDown className="h-4 w-4" />}
          label={t.lesson.helpfulNo}
          edge="right"
        />
      </div>
    </div>
  );
}

/**
 * Reusable lesson template (DESIGN.md §Lesson; reference layout). Renders any
 * lesson generically from its markdown `body`: an in-lesson "On this page"
 * section nav (parsed from headings), a collapsible course TOC with progress
 * (the RoadmapList), and a footer with "Was this helpful?" + Prev/Next. There
 * is no separate mark-complete button — pressing Next completes the lesson.
 * The next step is derived from the ordered `lessons` array; stepping uses
 * `replaceView` so the BackButton returns to the course in one hop.
 *
 * Review vs learn mode is inferred purely from `course.isCompleted` (no store
 * flag): on the last lesson, Next leads to the quiz when the course isn't yet
 * completed, and returns to the course page when it already is.
 */
export function LessonScreen({
  courseSlug,
  lessonId,
}: {
  courseSlug: string;
  lessonId: string;
}) {
  const { t } = useT();
  const goBack = useAppStore((s) => s.goBack);
  const replaceView = useAppStore((s) => s.replaceView);
  const { data: course, isPending, isError, refetch } = useCourseQuery(courseSlug);
  const completeMutation = useCompleteLessonMutation();
  // Shows a brief checkmark before stepping onward, so the "success" haptic has
  // a matching visual instead of an instant jump to the next lesson.
  const [justCompleted, setJustCompleted] = useState(false);
  const [completeError, setCompleteError] = useState(false);

  // `replaceView` swaps `lessonId` without unmounting this component, so
  // these transient flags would otherwise leak into the next lesson — e.g.
  // `justCompleted` staying true would leave the Next button permanently
  // disabled with a stale checkmark on whatever lesson loads afterward.
  useEffect(() => {
    setJustCompleted(false);
    setCompleteError(false);
  }, [lessonId]);

  // Same component instance, new lesson: without this, stepping to a shorter
  // lesson while scrolled deep into the previous one left the page's scroll
  // position wherever it was — which could land the sticky aside (and its own
  // sticky "Contents" heading, stuck at top:0 *within* the aside) in a
  // transient state where it hadn't reached its normal-flow position yet,
  // rendering it up over the site Header instead of below it. A real reader
  // also just expects a new lesson to start at the top regardless.
  useEffect(() => {
    getScrollContainer().scrollTo(0, 0);
  }, [lessonId]);

  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = index >= 0 ? course?.lessons[index] : undefined;

  // Parse the (pre-localized) markdown into heading-anchored sections. Memoized
  // on the body so it isn't re-parsed on every render.
  const parsed = useMemo(() => parseLessonBody(lesson?.body ?? ""), [lesson?.body]);
  const headings = parsed.sections.map((section) => section.heading);
  const hasSectionNav = headings.length > 1;
  const sectionIds = useMemo(() => parsed.sections.map((s) => s.heading.id), [parsed]);
  const activeSectionId = useActiveSectionId(sectionIds);

  if (isPending) {
    return (
      <Screen onBack={goBack} wide>
        <SkeletonList rows={5} />
      </Screen>
    );
  }
  if (isError || !course) {
    return (
      <Screen onBack={goBack} wide>
        <ErrorCard onRetry={() => void refetch()} />
      </Screen>
    );
  }
  if (!lesson) {
    return (
      <Screen onBack={goBack} wide>
        <ErrorCard onRetry={goBack} />
      </Screen>
    );
  }

  const prevLesson = index > 0 ? course.lessons[index - 1] : undefined;
  const nextLesson = course.lessons[index + 1];
  const firstQuiz = course.quizzes[0];
  const isLast = !nextLesson;

  // On the last lesson: go to the quiz if the course isn't completed yet
  // (learn mode), otherwise return to the course (review mode). Everywhere
  // else: step to the next lesson.
  const navigateNext = () => {
    if (nextLesson) {
      replaceView({ name: "lesson", courseSlug, lessonId: nextLesson.id });
      return;
    }
    if (!course.isCompleted && firstQuiz) {
      replaceView({ name: "quiz", courseSlug, quizId: firstQuiz.id });
      return;
    }
    goBack(); // review mode (or no quiz) → back to the course
  };

  const goToLesson = (id: string) => replaceView({ name: "lesson", courseSlug, lessonId: id });
  const goToQuiz = (id: string) => replaceView({ name: "quiz", courseSlug, quizId: id });

  const onNext = () => {
    // Pressing Next is what marks the lesson complete (idempotent server-side).
    if (lesson.completed) {
      navigateNext();
      return;
    }
    setCompleteError(false);
    completeMutation.mutate(
      { lessonId: lesson.id, courseSlug },
      {
        onSuccess: () => {
          notificationHaptic("success");
          setJustCompleted(true);
          window.setTimeout(navigateNext, prefersReducedMotion() ? 0 : 450);
        },
        onError: () => {
          notificationHaptic("error");
          setCompleteError(true);
        },
      },
    );
  };

  const nextLabel = nextLesson
    ? t.lesson.next
    : !course.isCompleted && firstQuiz
      ? t.lesson.toQuiz
      : t.lesson.finish;

  const nextPending = completeMutation.isPending || justCompleted;

  // Sticky within the aside's own scroll box (not just the aside's position on
  // the page) — otherwise, once the roadmap + "On this page" list together
  // taller than the box, scrolling it internally carries this label away with
  // the rest instead of staying pinned at the top the way a section heading
  // should. The solid background matters here too: without it, list items
  // scrolling underneath would show through.
  const contentsHeading = (
    <p className="sticky top-0 z-10 mb-2 bg-bg px-3 pb-2 pt-1 text-[13px] font-semibold uppercase tracking-wide text-text-muted">
      {t.lesson.contents}
    </p>
  );

  return (
    <Screen onBack={goBack} wide>
      {/* Content column first, sidebar second — both in the DOM (grid track
         order follows DOM order, so this — not a CSS `order` override on the
         aside — is what actually puts the sidebar on the right) and visually. */}
      <div className="md:grid md:grid-cols-[1fr_240px] md:gap-8 lg:grid-cols-[1fr_280px] lg:gap-10">
        <div className="min-w-0">
          <p className="text-[13px] font-medium uppercase tracking-wide text-text-muted">
            {format(t.lesson.eyebrow, {
              current: index + 1,
              total: course.lessons.length,
            })}
          </p>
          <h1 className="mb-5 mt-1 text-2xl font-bold leading-tight">{lesson.title}</h1>

          {/* <960px: collapsible "On this page", placed next to the content it
             navigates. */}
          {hasSectionNav && (
            <details className="group mb-6 rounded-2xl border border-border bg-surface md:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-text-muted">
                <span className="inline-flex items-center gap-2">
                  <ListTree className="h-4 w-4" />
                  {t.lesson.onThisPage}
                </span>
                <ChevronDown className="h-4 w-4 transition-transform duration-150 group-open:rotate-180" />
              </summary>
              <div className="px-2 pb-2">
                <OnThisPage sections={headings} activeId={activeSectionId} onJump={scrollToSection} />
              </div>
            </details>
          )}

          <article>
            {parsed.preamble && <LessonMarkdown>{parsed.preamble}</LessonMarkdown>}
            {parsed.sections.map((section) => (
              <section
                key={section.heading.id}
                id={sectionDomId(section.heading.id)}
                className="scroll-mt-32"
              >
                <LessonMarkdown>{section.content}</LessonMarkdown>
              </section>
            ))}
          </article>

          {/* <960px: collapsible course TOC with progress. */}
          <details className="group mt-8 rounded-2xl border border-border bg-surface md:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-text-muted">
              {t.lesson.contents}
              <ChevronDown className="h-4 w-4 transition-transform duration-150 group-open:rotate-180" />
            </summary>
            <div className="px-2 pb-2">
              <RoadmapList
                lessons={course.lessons}
                quizzes={course.quizzes}
                currentLessonId={lesson.id}
                onSelectLesson={goToLesson}
                onSelectQuiz={goToQuiz}
              />
            </div>
          </details>

          {/* Footer: "Was this helpful?" + Prev/Next (DESIGN.md §Lesson). */}
          <footer className="mt-10 border-t border-border pt-6">
            <WasThisHelpful
              lessonId={lesson.id}
              courseSlug={courseSlug}
              initial={lesson.feedbackHelpful ?? null}
            />

            {completeError && (
              <p className="mt-4 text-center text-xs text-danger">{t.error.generic}</p>
            )}

            <nav
              className={cn(
                "mt-6 grid gap-3",
                prevLesson ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {prevLesson && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => goToLesson(prevLesson.id)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.lesson.prev}
                </Button>
              )}
              <Button variant="primary" size="lg" disabled={nextPending} onClick={onNext}>
                {completeMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : justCompleted ? (
                  <Check className="check-pop h-4 w-4" />
                ) : null}
                {nextLabel}
                {!isLast && !nextPending && <ChevronRight className="h-4 w-4" />}
              </Button>
            </nav>
          </footer>
        </div>

        {/* ≥960px: persistent sticky rail with the course TOC and, below it, the
           in-lesson "On this page" nav. Below md the two become collapsibles in
           the content column instead. */}
        <aside className="hidden md:block md:sticky md:top-28 md:max-h-[calc(100vh-8rem)] md:self-start md:overflow-y-auto">
          {contentsHeading}
          <RoadmapList
            lessons={course.lessons}
            quizzes={course.quizzes}
            currentLessonId={lesson.id}
            onSelectLesson={goToLesson}
            onSelectQuiz={goToQuiz}
          />
          {hasSectionNav && (
            <>
              <p className="mb-2 mt-6 px-3 text-[13px] font-semibold uppercase tracking-wide text-text-muted">
                {t.lesson.onThisPage}
              </p>
              <OnThisPage sections={headings} activeId={activeSectionId} onJump={scrollToSection} />
            </>
          )}
        </aside>
      </div>
    </Screen>
  );
}

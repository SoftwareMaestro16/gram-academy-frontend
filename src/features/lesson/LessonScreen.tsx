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

/** In-lesson section jump list ("On this page"), derived from the body's
 *  headings. Generic — works for any lesson. */
function OnThisPage({
  sections,
  onJump,
}: {
  sections: LessonSection[];
  onJump: (id: string) => void;
}) {
  return (
    <nav className="space-y-0.5">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onJump(section.id)}
          className={cn(
            "block min-h-9 w-full truncate rounded-lg py-1.5 pr-3 text-left text-sm text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text",
            INDENT_BY_LEVEL[section.level] ?? "pl-3",
          )}
        >
          {section.title}
        </button>
      ))}
    </nav>
  );
}

function FeedbackButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {icon}
      {label}
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
      <div className="flex gap-2">
        <FeedbackButton
          active={choice === true}
          onClick={() => choose(true)}
          icon={<ThumbsUp className="h-4 w-4" />}
          label={t.lesson.helpfulYes}
        />
        <FeedbackButton
          active={choice === false}
          onClick={() => choose(false)}
          icon={<ThumbsDown className="h-4 w-4" />}
          label={t.lesson.helpfulNo}
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

  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = index >= 0 ? course?.lessons[index] : undefined;

  // Parse the (pre-localized) markdown into heading-anchored sections. Memoized
  // on the body so it isn't re-parsed on every render.
  const parsed = useMemo(() => parseLessonBody(lesson?.body ?? ""), [lesson?.body]);
  const headings = parsed.sections.map((section) => section.heading);
  const hasSectionNav = headings.length > 1;

  if (isPending) {
    return (
      <Screen onBack={goBack}>
        <SkeletonList rows={5} />
      </Screen>
    );
  }
  if (isError || !course) {
    return (
      <Screen onBack={goBack}>
        <ErrorCard onRetry={() => void refetch()} />
      </Screen>
    );
  }
  if (!lesson) {
    return (
      <Screen onBack={goBack}>
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

  const contentsHeading = (
    <p className="mb-2 px-3 text-[13px] font-semibold uppercase tracking-wide text-text-muted">
      {t.lesson.contents}
    </p>
  );

  return (
    <Screen onBack={goBack}>
      <div className="md:grid md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
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
              <OnThisPage sections={headings} onJump={scrollToSection} />
            </>
          )}
        </aside>

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
                <OnThisPage sections={headings} onJump={scrollToSection} />
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
      </div>
    </Screen>
  );
}

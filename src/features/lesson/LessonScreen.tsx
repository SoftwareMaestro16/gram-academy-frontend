import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Markdown } from "../../components/Markdown";
import { NextCard } from "../../components/NextCard";
import { RoadmapList } from "../../components/RoadmapList";
import { ErrorCard, SkeletonList, Spinner } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useCompleteLessonMutation, useCourseQuery } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";
import { cn } from "../../lib/cn";
import { notificationHaptic } from "../../lib/telegram";
import { prefersReducedMotion } from "../../lib/motion";

/**
 * Lesson reader (DESIGN.md §Lesson, §Responsive breakpoints): eyebrow
 * "Урок X из N", title, reading-first markdown body, a lesson navigator (the
 * RoadmapList), and a NextCard + mark-complete action. Below 960px the
 * navigator is a collapsible sheet reachable without leaving the page; at
 * ≥960px it becomes a persistent, sticky left sidebar (docs-layout: roadmap
 * left, reading column right) instead. The next lesson is derived from the
 * ordered `lessons` array; stepping uses `replaceView` so BackButton returns
 * to the course in one hop.
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
  // Shows the checkmark confirmation for a beat before stepping onward, so
  // the "success" haptic has a matching visual instead of an instant jump
  // to the next lesson.
  const [justCompleted, setJustCompleted] = useState(false);

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

  const index = course.lessons.findIndex((l) => l.id === lessonId);
  const lesson = index >= 0 ? course.lessons[index] : undefined;
  if (!lesson) {
    return (
      <Screen onBack={goBack}>
        <ErrorCard onRetry={goBack} />
      </Screen>
    );
  }

  const nextLesson = course.lessons[index + 1];

  const goNext = () => {
    if (nextLesson) {
      replaceView({ name: "lesson", courseSlug, lessonId: nextLesson.id });
    } else {
      goBack(); // back to the course
    }
  };

  const onComplete = () => {
    completeMutation.mutate(
      { lessonId: lesson.id, courseSlug },
      {
        onSuccess: () => {
          notificationHaptic("success");
          setJustCompleted(true);
          // Let the checkmark pop-in play before stepping onward; skip the
          // hold for reduced-motion users since there's no animation to see.
          window.setTimeout(goNext, prefersReducedMotion() ? 0 : 450);
        },
      },
    );
  };

  const goToLesson = (id: string) => replaceView({ name: "lesson", courseSlug, lessonId: id });
  const goToQuiz = (id: string) => replaceView({ name: "quiz", courseSlug, quizId: id });

  return (
    <Screen onBack={goBack}>
      <div className="md:grid md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
        {/* ≥960px: persistent sticky sidebar navigator (docs-layout). Hidden
           below that — the collapsible sheet further down covers it instead. */}
        <aside className="hidden md:block md:sticky md:top-28 md:max-h-[calc(100vh-8rem)] md:self-start md:overflow-y-auto">
          <p className="mb-2 px-3 text-[13px] font-semibold uppercase tracking-wide text-text-muted">
            {t.lesson.contents}
          </p>
          <RoadmapList
            lessons={course.lessons}
            quizzes={course.quizzes}
            currentLessonId={lesson.id}
            onSelectLesson={goToLesson}
            onSelectQuiz={goToQuiz}
          />
        </aside>

        <div className="min-w-0">
          <p className="text-[13px] font-medium uppercase tracking-wide text-text-muted">
            {format(t.lesson.eyebrow, {
              current: index + 1,
              total: course.lessons.length,
            })}
          </p>
          <h1 className="mb-5 mt-1 text-2xl font-bold leading-tight">
            {lesson.title}
          </h1>

          <article>
            <Markdown>{lesson.body}</Markdown>
          </article>

          {/* <960px: collapsible lesson navigator (redundant once the sticky
             sidebar is always visible, so hidden at md+). */}
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

          <div className="mt-8 space-y-3">
            {lesson.completed || justCompleted ? (
              <div className="flex items-center justify-center gap-2 text-sm text-success">
                <Check
                  className={cn("h-4 w-4", justCompleted && "check-pop")}
                />
                {t.lesson.completed}
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                disabled={completeMutation.isPending}
                onClick={onComplete}
              >
                {completeMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {t.lesson.markComplete}
              </Button>
            )}

            {nextLesson ? (
              <NextCard title={nextLesson.title} onClick={goNext} />
            ) : (
              lesson.completed && (
                <Button variant="secondary" fullWidth size="lg" onClick={goBack}>
                  {t.lesson.finish}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}

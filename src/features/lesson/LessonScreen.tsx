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
import { impactHaptic } from "../../lib/telegram";

/**
 * Lesson reader (DESIGN.md §Lesson): eyebrow "Урок X из N", title, reading-first
 * markdown body, a collapsible roadmap navigator, and a NextCard + mark-complete
 * action. The next lesson is derived from the ordered `lessons` array; stepping
 * uses `replaceView` so BackButton returns to the course in one hop.
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
          impactHaptic("light");
          goNext();
        },
      },
    );
  };

  return (
    <Screen onBack={goBack}>
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

      {/* Collapsible lesson navigator (RoadmapList) */}
      <details className="group mt-8 rounded-2xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-text-muted">
          {t.lesson.contents}
          <ChevronDown className="h-4 w-4 transition-transform duration-150 group-open:rotate-180" />
        </summary>
        <div className="px-2 pb-2">
          <RoadmapList
            lessons={course.lessons}
            quizzes={course.quizzes}
            currentLessonId={lesson.id}
            onSelectLesson={(id) =>
              replaceView({ name: "lesson", courseSlug, lessonId: id })
            }
            onSelectQuiz={(id) =>
              replaceView({ name: "quiz", courseSlug, quizId: id })
            }
          />
        </div>
      </details>

      <div className="mt-8 space-y-3">
        {lesson.completed ? (
          <div className="flex items-center justify-center gap-2 text-sm text-success">
            <Check className="h-4 w-4" />
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
    </Screen>
  );
}

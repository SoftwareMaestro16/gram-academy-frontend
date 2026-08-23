import { useState } from "react";
import { Award, RefreshCw, XCircle } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";
import { ErrorCard, SkeletonList, Spinner } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useCourseQuery, useSubmitQuizMutation } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";
import { cn } from "../../lib/cn";
import { impactHaptic, notificationHaptic, selectionHaptic } from "../../lib/telegram";
import type { QuizSubmitResult } from "../../api/schemas";

export function QuizScreen({
  courseSlug,
  quizId,
}: {
  courseSlug: string;
  quizId: string;
}) {
  const { t } = useT();
  const goBack = useAppStore((s) => s.goBack);
  const { data: course, isPending, isError, refetch } = useCourseQuery(courseSlug);
  const submitMutation = useSubmitQuizMutation();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  if (isPending) {
    return (
      <Screen onBack={goBack}>
        <SkeletonList rows={4} />
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

  const quiz = course.quizzes.find((q) => q.id === quizId);
  if (!quiz || quiz.questions.length === 0) {
    return (
      <Screen onBack={goBack}>
        <ErrorCard onRetry={goBack} />
      </Screen>
    );
  }

  const total = quiz.questions.length;

  // --- Result screen -------------------------------------------------------
  if (result) {
    return (
      <Screen title={quiz.title || t.course.quiz} onBack={goBack}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full",
              result.passed ? "bg-success-soft" : "bg-surface-2",
            )}
          >
            {result.passed ? (
              <Award className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-danger" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {result.passed ? t.quiz.passedTitle : t.quiz.failedTitle}
          </h2>
          <p className="text-text-muted">
            {format(t.quiz.score, { score: result.score })}
          </p>
          {result.passed ? (
            <Button variant="primary" size="lg" fullWidth onClick={goBack}>
              {t.quiz.continue}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => {
                setResult(null);
                setAnswers([]);
                setIndex(0);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              {t.quiz.retry}
            </Button>
          )}
        </div>
      </Screen>
    );
  }

  // --- Question stepper ----------------------------------------------------
  const question = quiz.questions[index];
  if (!question) {
    return (
      <Screen onBack={goBack}>
        <ErrorCard onRetry={goBack} />
      </Screen>
    );
  }

  const selected = answers[index] ?? -1;
  const isLast = index === total - 1;

  const pick = (option: number) => {
    selectionHaptic();
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = option;
      return next;
    });
  };

  const advance = () => {
    if (selected < 0) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    impactHaptic("medium");
    submitMutation.mutate(
      { quizId, courseSlug, answers },
      {
        onSuccess: (data) => {
          notificationHaptic(data.passed ? "success" : "error");
          setResult(data);
        },
      },
    );
  };

  return (
    <Screen title={quiz.title || t.course.quiz} onBack={goBack}>
      <div className="mb-4">
        <p className="mb-2 text-xs text-text-muted">
          {format(t.quiz.progress, { current: index + 1, total })}
        </p>
        <ProgressBar value={index + 1} max={total} />
      </div>

      <h2 className="text-xl font-semibold leading-snug">{question.question}</h2>

      <div className="mt-5 space-y-2.5">
        {question.options.map((option, optionIndex) => {
          const active = selected === optionIndex;
          return (
            <button
              key={optionIndex}
              type="button"
              onClick={() => pick(optionIndex)}
              className={cn(
                "flex w-full min-h-[44px] items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors duration-150",
                active
                  ? "border-accent bg-accent-soft text-text"
                  : "border-border bg-surface text-text hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  active ? "border-accent" : "border-text-faint",
                )}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
              <span className="flex-1">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={selected < 0 || submitMutation.isPending}
          onClick={advance}
        >
          {submitMutation.isPending ? (
            <Spinner className="h-4 w-4" />
          ) : null}
          {isLast ? t.quiz.submit : t.quiz.next}
        </Button>
        {selected < 0 && (
          <p className="mt-2 text-center text-xs text-text-muted">
            {t.quiz.selectAnswer}
          </p>
        )}
      </div>
    </Screen>
  );
}

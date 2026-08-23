import { useEffect, useMemo, useRef, useState } from "react";
import { Award, RefreshCw, XCircle } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ProgressBar } from "../../components/ProgressBar";
import { ErrorCard, SkeletonList, Spinner } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import {
  useAnswerQuizMutation,
  useCourseQuery,
  useStartQuizMutation,
  useViolateQuizMutation,
} from "../../api/queries";
import { ApiError } from "../../api/http";
import { useAppStore } from "../../state/useAppStore";
import { cn } from "../../lib/cn";
import { impactHaptic, notificationHaptic, selectionHaptic } from "../../lib/telegram";
import { useCountdownTo } from "../../lib/useCountdown";
import { useNoCopyGuard } from "../../lib/useNoCopyGuard";
import { onAppBackgrounded } from "../../lib/visibility";
import { formatDuration, minCorrectAnswers } from "./quizMath";
import type { QuizDetail, QuizQuestionReveal } from "../../api/schemas";

/**
 * Quiz attempt state machine (QUIZ-INTEGRITY.md): pre-quiz rules -> `/start`
 * -> per-question reveal (`/answer`, one question at a time, each with its
 * own 30s server clock) -> result. A background/hidden event during "active"
 * calls `/violate` and finalizes as failed, same as a timeout. Grading,
 * timing, shuffling, and cooldown are entirely server-authoritative.
 */
type Phase =
  | { name: "rules" }
  | {
      name: "active";
      attemptId: string;
      totalQuestions: number;
      questionTimeLimitSeconds: number;
      question: QuizQuestionReveal;
    }
  | { name: "result"; passed: boolean; score: number; retryAfterSeconds: number | null };

const CLOCK_LOCALE: Record<string, string> = { en: "en-US", ru: "ru-RU", zh: "zh-CN" };

function formatClock(ms: number, locale: string): string {
  return new Intl.DateTimeFormat(CLOCK_LOCALE[locale] ?? "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

// --- Pre-quiz rules screen ---------------------------------------------------

function RulesView({
  quiz,
  pending,
  onStart,
}: {
  quiz: QuizDetail;
  pending: boolean;
  onStart: () => void;
}) {
  const { t, locale } = useT();
  const total = quiz.questions.length;
  const minCorrect = minCorrectAnswers(total);
  const cooldownMs = quiz.cooldownUntil ? new Date(quiz.cooldownUntil).getTime() : null;
  const cooldownSecondsLeft = useCountdownTo(cooldownMs);
  const showCooldown = cooldownMs !== null && cooldownSecondsLeft > 0;

  const rules = [
    t.quiz.ruleTimer,
    t.quiz.ruleShuffle,
    t.quiz.ruleNoLeave,
    t.quiz.ruleNoCopy,
    format(t.quiz.ruleThreshold, { min: minCorrect, total }),
    t.quiz.ruleCooldown,
  ];

  return (
    <>
      <Card>
        <h2 className="text-sm font-semibold text-text-muted">{t.quiz.rulesHeading}</h2>
        <ul className="mt-3 space-y-2.5 text-sm">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span aria-hidden className="text-accent">
                •
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6">
        {showCooldown && cooldownMs !== null ? (
          <Card className="text-center">
            <p className="font-medium">{t.quiz.cooldownHeading}</p>
            <p className="mt-1 text-sm text-text-muted">
              {format(t.quiz.cooldownAvailableAt, { time: formatClock(cooldownMs, locale) })}{" "}
              {format(t.quiz.cooldownIn, { duration: formatDuration(cooldownSecondsLeft) })}
            </p>
          </Card>
        ) : (
          <Button variant="primary" fullWidth size="lg" disabled={pending} onClick={onStart}>
            {pending ? <Spinner className="h-4 w-4" /> : null}
            {t.quiz.start}
          </Button>
        )}
      </div>
    </>
  );
}

// --- Active question ----------------------------------------------------------

function QuestionView({
  phase,
  selected,
  setSelected,
  onSubmit,
  pending,
}: {
  phase: Extract<Phase, { name: "active" }>;
  selected: number;
  setSelected: (index: number) => void;
  onSubmit: (optionIndex: number) => void;
  pending: boolean;
}) {
  const { t } = useT();
  const { question, totalQuestions, questionTimeLimitSeconds } = phase;

  // Client-local deadline — cosmetic only; the server's own clock (revealedAt
  // + 30s + 3s grace) is authoritative regardless of what this renders.
  const targetMs = useMemo(
    () => Date.now() + questionTimeLimitSeconds * 1000,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  );
  const secondsLeft = useCountdownTo(targetMs);
  const urgent = secondsLeft > 0 && secondsLeft <= 5;
  const timeUp = secondsLeft <= 0;

  const submittedRef = useRef(false);
  useEffect(() => {
    submittedRef.current = false;
  }, [question.id]);

  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Auto-submit once the visual timer hits zero — locks input and is also
  // the only way the client learns a late answer got treated as a timeout.
  useEffect(() => {
    if (secondsLeft > 0 || submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(selectedRef.current >= 0 ? selectedRef.current : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const pick = (optionIndex: number) => {
    if (timeUp) return;
    selectionHaptic();
    setSelected(optionIndex);
  };

  const isLastQuestion = question.index === totalQuestions - 1;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="mb-2 text-xs text-text-muted">
            {format(t.quiz.progress, { current: question.index + 1, total: totalQuestions })}
          </p>
          <ProgressBar value={question.index + 1} max={totalQuestions} />
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
            urgent
              ? "animate-pulse bg-danger/15 text-danger"
              : "bg-surface-2 text-text-muted",
          )}
        >
          {timeUp ? t.quiz.timeUp : format(t.quiz.timeLeft, { s: secondsLeft })}
        </span>
      </div>

      <div className="no-copy">
        <h2 className="text-xl font-semibold leading-snug">{question.question}</h2>

        <div className="mt-5 space-y-2.5">
          {question.options.map((option, optionIndex) => {
            const active = selected === optionIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                disabled={timeUp}
                onClick={() => pick(optionIndex)}
                className={cn(
                  "flex w-full min-h-[44px] items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors duration-150 disabled:opacity-60",
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
      </div>

      <div className="mt-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={selected < 0 || pending || timeUp}
          onClick={() => onSubmit(selected)}
        >
          {pending ? <Spinner className="h-4 w-4" /> : null}
          {isLastQuestion ? t.quiz.submit : t.quiz.next}
        </Button>
        {selected < 0 && !timeUp && (
          <p className="mt-2 text-center text-xs text-text-muted">{t.quiz.selectAnswer}</p>
        )}
      </div>
    </>
  );
}

// --- Result (pass / fail / timeout / violation — same copy for the latter three) --

function ResultView({
  phase,
  onContinue,
  onRetry,
}: {
  phase: Extract<Phase, { name: "result" }>;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const { t } = useT();
  const { passed, score, retryAfterSeconds } = phase;

  const retryTargetMs = useMemo(
    () => (retryAfterSeconds != null ? Date.now() + retryAfterSeconds * 1000 : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const retrySecondsLeft = useCountdownTo(retryTargetMs);
  const stillCoolingDown = retryTargetMs !== null && retrySecondsLeft > 0;

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full",
          passed ? "bg-success-soft" : "bg-surface-2",
        )}
      >
        {passed ? (
          <Award className="h-10 w-10 text-success" />
        ) : (
          <XCircle className="h-10 w-10 text-danger" />
        )}
      </div>
      <h2 className="text-2xl font-bold">{passed ? t.quiz.passedTitle : t.quiz.failedTitle}</h2>
      <p className="text-text-muted">{format(t.quiz.score, { score })}</p>

      {/* Same copy whether this was a real fail, a timeout, or a violation. */}
      {!passed && <p className="max-w-sm text-sm text-text-muted">{t.quiz.failedBody}</p>}

      {passed ? (
        <Button variant="primary" size="lg" fullWidth onClick={onContinue}>
          {t.quiz.continue}
        </Button>
      ) : stillCoolingDown ? (
        <p className="text-sm font-medium text-text-muted">
          {format(t.quiz.retryCountdown, { duration: formatDuration(retrySecondsLeft) })}
        </p>
      ) : (
        <Button variant="secondary" size="lg" fullWidth onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          {t.quiz.retry}
        </Button>
      )}
    </div>
  );
}

// --- Orchestrator ------------------------------------------------------------

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

  const startMutation = useStartQuizMutation();
  const answerMutation = useAnswerQuizMutation();
  const violateMutation = useViolateQuizMutation();

  const [phase, setPhase] = useState<Phase>({ name: "rules" });
  const [selected, setSelected] = useState(-1);

  const isActive = phase.name === "active";

  // No-copy deterrent — quiz screen only, and only while an attempt is active.
  useNoCopyGuard(isActive);

  // Backgrounding -> /violate -> failure screen. Subscribes once on entering
  // "active" and stops once the attempt finalizes (dependency on the boolean,
  // not on `phase` itself, so it doesn't resubscribe per question).
  useEffect(() => {
    if (phase.name !== "active") return;
    const { attemptId } = phase;
    const cleanup = onAppBackgrounded(() => {
      violateMutation.mutate(
        { quizId, attemptId, courseSlug },
        {
          onSuccess: (data) => {
            notificationHaptic("error");
            setPhase({
              name: "result",
              passed: false,
              score: data.score,
              retryAfterSeconds: data.retryAfterSeconds,
            });
          },
          onError: () => {
            // Network failure mid-violate — the server will still time the
            // attempt out on its own; reflect the same outcome locally so
            // the user isn't stuck.
            notificationHaptic("error");
            setPhase({ name: "result", passed: false, score: 0, retryAfterSeconds: 3600 });
          },
        },
      );
    });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

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

  const handleStart = () => {
    startMutation.mutate(quizId, {
      onSuccess: (data) => {
        setSelected(-1);
        setPhase({
          name: "active",
          attemptId: data.attemptId,
          totalQuestions: data.totalQuestions,
          questionTimeLimitSeconds: data.questionTimeLimitSeconds,
          question: data.question,
        });
      },
      onError: (error) => {
        if (error instanceof ApiError && error.code === "quiz_cooldown") {
          // Race with the cooldown boundary — refetch so cooldownUntil is
          // populated and the rules screen blocks Start on its own.
          void refetch();
        }
      },
    });
  };

  const handleSubmit = (optionIndex: number) => {
    if (phase.name !== "active") return;
    const { attemptId, question } = phase;
    answerMutation.mutate(
      {
        quizId,
        attemptId,
        questionIndex: question.index,
        selectedOption: optionIndex,
        courseSlug,
      },
      {
        onSuccess: (data) => {
          if (data.done) {
            notificationHaptic(data.passed ? "success" : "error");
            setPhase({
              name: "result",
              passed: data.passed,
              score: data.score,
              retryAfterSeconds: data.retryAfterSeconds,
            });
          } else {
            impactHaptic("light");
            setSelected(-1);
            setPhase((prev) =>
              prev.name === "active" ? { ...prev, question: data.question } : prev,
            );
          }
        },
        onError: () => {
          notificationHaptic("error");
          setPhase({ name: "result", passed: false, score: 0, retryAfterSeconds: 3600 });
        },
      },
    );
  };

  return (
    <Screen title={quiz.title || t.course.quiz} onBack={goBack}>
      {phase.name === "rules" && (
        <RulesView quiz={quiz} pending={startMutation.isPending} onStart={handleStart} />
      )}
      {phase.name === "active" && (
        <QuestionView
          phase={phase}
          selected={selected}
          setSelected={setSelected}
          onSubmit={handleSubmit}
          pending={answerMutation.isPending}
        />
      )}
      {phase.name === "result" && (
        <ResultView
          phase={phase}
          onContinue={goBack}
          onRetry={() => setPhase({ name: "rules" })}
        />
      )}
    </Screen>
  );
}

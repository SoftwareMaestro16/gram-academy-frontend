import { postJson } from "./http";
import {
  quizAnswerResponseSchema,
  quizStartResponseSchema,
  quizViolateResponseSchema,
  type QuizAnswerResponse,
  type QuizStartResponse,
  type QuizViolateResponse,
} from "./schemas";

/**
 * Quiz attempt flow (QUIZ-INTEGRITY.md). Replaces the old
 * `POST /v1/quizzes/:id/submit`. Questions are revealed one at a time by the
 * server; grading/timing/shuffling/cooldown are entirely server-authoritative.
 */

/** POST /v1/quizzes/:id/start — begin (or idempotently resume) the caller's
 *  attempt. 429 `{ error: "quiz_cooldown", retryAfterSeconds }` if on cooldown. */
export function startQuizAttempt(quizId: string): Promise<QuizStartResponse> {
  return postJson(
    `/v1/quizzes/${encodeURIComponent(quizId)}/start`,
    undefined,
    quizStartResponseSchema,
  );
}

/** POST /v1/quizzes/:id/attempts/:attemptId/answer — submit the current
 *  question's pick; returns the next question or the finalize result. */
export function answerQuizQuestion(
  quizId: string,
  attemptId: string,
  questionIndex: number,
  selectedOption: number,
): Promise<QuizAnswerResponse> {
  return postJson(
    `/v1/quizzes/${encodeURIComponent(quizId)}/attempts/${encodeURIComponent(attemptId)}/answer`,
    { questionIndex, selectedOption },
    quizAnswerResponseSchema,
  );
}

/** POST /v1/quizzes/:id/attempts/:attemptId/violate — the app was backgrounded
 *  mid-attempt; finalizes it as failed immediately (same as a timeout).
 *  `keepalive` lets the request survive the page being hidden/suspended. */
export function violateQuizAttempt(
  quizId: string,
  attemptId: string,
): Promise<QuizViolateResponse> {
  return postJson(
    `/v1/quizzes/${encodeURIComponent(quizId)}/attempts/${encodeURIComponent(attemptId)}/violate`,
    { reason: "backgrounded" },
    quizViolateResponseSchema,
    { keepalive: true },
  );
}

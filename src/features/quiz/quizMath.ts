/**
 * Public, display-only pass threshold (QUIZ-INTEGRITY.md §Pass threshold):
 * `minCorrect = N - round(N / 4)`, round-half-up (JS `Math.round` semantics).
 * NEVER used to decide pass/fail — only the server's `passed` from the
 * finalize response (`/answer` done:true or `/violate`) is authoritative.
 * Shown on the pre-quiz rules screen for transparency only.
 */
export function minCorrectAnswers(totalQuestions: number): number {
  return totalQuestions - Math.round(totalQuestions / 4);
}

/** Formats whole seconds as `M:SS` (e.g. 65 -> "1:05"), clamped to >= 0. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

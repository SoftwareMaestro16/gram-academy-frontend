import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "../state/useAppStore";
import { postJson } from "./http";
import { contentKeys } from "./queries";
import {
  courseRatingResponseSchema,
  lessonFeedbackResponseSchema,
  type CourseRatingResponse,
  type LessonFeedbackResponse,
} from "./schemas";

/**
 * Engagement mutations (lesson "was this helpful?" + post-quiz course rating).
 * These are additive and best-effort: the endpoints may 404 before the backend
 * ships them, so callers swallow failures and keep an optimistic local pick.
 * The authoritative value is read back from `LessonDetail.feedbackHelpful` /
 * `CourseDetail.myRating` once the backend is live — hence the course-query
 * invalidation on success. No business logic lives here.
 */

/** POST /v1/lessons/:lessonId/feedback `{ helpful }`. */
export function sendLessonFeedback(
  lessonId: string,
  helpful: boolean,
): Promise<LessonFeedbackResponse> {
  return postJson(
    `/v1/lessons/${encodeURIComponent(lessonId)}/feedback`,
    { helpful },
    lessonFeedbackResponseSchema,
  );
}

/** POST /v1/courses/:slug/rating `{ rating }` (1–5). */
export function rateCourse(slug: string, rating: number): Promise<CourseRatingResponse> {
  return postJson(
    `/v1/courses/${encodeURIComponent(slug)}/rating`,
    { rating },
    courseRatingResponseSchema,
  );
}

export function useLessonFeedbackMutation() {
  const queryClient = useQueryClient();
  const locale = useAppStore((s) => s.locale);
  return useMutation({
    mutationFn: (vars: { lessonId: string; courseSlug: string; helpful: boolean }) =>
      sendLessonFeedback(vars.lessonId, vars.helpful),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: contentKeys.course(vars.courseSlug, locale),
      });
    },
  });
}

export function useRateCourseMutation() {
  const queryClient = useQueryClient();
  const locale = useAppStore((s) => s.locale);
  return useMutation({
    mutationFn: (vars: { slug: string; rating: number }) =>
      rateCourse(vars.slug, vars.rating),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: contentKeys.course(vars.slug, locale),
      });
    },
  });
}

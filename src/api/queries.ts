import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAppStore } from "../state/useAppStore";
import { authTelegram, fetchMe, updateLocale } from "./auth";
import { completeLesson, fetchCourse, fetchSections } from "./courses";
import { answerQuizQuestion, startQuizAttempt, violateQuizAttempt } from "./quiz";
import type { Locale, MeResponse } from "./schemas";

// --- Query keys ------------------------------------------------------------
// Personal/auth state and content are keyed separately; content keys include
// the locale so switching language fetches the pre-localized variant.

export const authKeys = {
  me: ["auth", "me"] as const,
};

export const contentKeys = {
  all: ["content"] as const,
  sections: (locale: Locale) => ["content", "sections", locale] as const,
  course: (slug: string, locale: Locale) =>
    ["content", "course", slug, locale] as const,
};

// --- Query option factories ------------------------------------------------

export function sectionsQueryOptions(locale: Locale) {
  return queryOptions({
    queryKey: contentKeys.sections(locale),
    queryFn: () => fetchSections(locale),
  });
}

export function courseQueryOptions(slug: string, locale: Locale) {
  return queryOptions({
    queryKey: contentKeys.course(slug, locale),
    queryFn: () => fetchCourse(slug, locale),
  });
}

// --- Auth ------------------------------------------------------------------

/** Reads the cached session identity (seeded by the auth bootstrap). */
export function useMe() {
  return useQuery({ queryKey: authKeys.me, queryFn: fetchMe });
}

/** POST /v1/auth/telegram — used once at boot to establish the session. */
export function useAuthTelegramMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (initData: string) => authTelegram(initData),
    onSuccess: (me: MeResponse) => {
      queryClient.setQueryData(authKeys.me, me);
    },
  });
}

/** PATCH /v1/auth/me — persist locale; refresh me + all content. */
export function useUpdateLocaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locale: Locale) => updateLocale(locale),
    onSuccess: (me: MeResponse) => {
      queryClient.setQueryData(authKeys.me, me);
      void queryClient.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
}

// --- Content queries -------------------------------------------------------

export function useSectionsQuery() {
  const locale = useAppStore((s) => s.locale);
  return useQuery(sectionsQueryOptions(locale));
}

export function useCourseQuery(slug: string) {
  const locale = useAppStore((s) => s.locale);
  return useQuery(courseQueryOptions(slug, locale));
}

// --- Content mutations -----------------------------------------------------

export function useCompleteLessonMutation() {
  const queryClient = useQueryClient();
  const locale = useAppStore((s) => s.locale);
  return useMutation({
    mutationFn: (vars: { lessonId: string; courseSlug: string }) =>
      completeLesson(vars.lessonId),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: contentKeys.course(vars.courseSlug, locale),
      });
      void queryClient.invalidateQueries({
        queryKey: contentKeys.sections(locale),
      });
    },
  });
}

// --- Quiz attempt flow (QUIZ-INTEGRITY.md) ----------------------------------

/** POST /v1/quizzes/:id/start — no course/sections invalidation: starting an
 *  attempt doesn't change any persisted state, only cache-level session state. */
export function useStartQuizMutation() {
  return useMutation({
    mutationFn: (quizId: string) => startQuizAttempt(quizId),
  });
}

/** POST /v1/quizzes/:id/attempts/:attemptId/answer — invalidate course +
 *  sections only once the attempt finalizes (`done: true`), since that's the
 *  only point progress/certificate-eligibility can change. */
export function useAnswerQuizMutation() {
  const queryClient = useQueryClient();
  const locale = useAppStore((s) => s.locale);
  return useMutation({
    mutationFn: (vars: {
      quizId: string;
      attemptId: string;
      questionIndex: number;
      selectedOption: number;
      courseSlug: string;
    }) =>
      answerQuizQuestion(
        vars.quizId,
        vars.attemptId,
        vars.questionIndex,
        vars.selectedOption,
      ),
    onSuccess: (data, vars) => {
      if (data.done) {
        void queryClient.invalidateQueries({
          queryKey: contentKeys.course(vars.courseSlug, locale),
        });
        void queryClient.invalidateQueries({
          queryKey: contentKeys.sections(locale),
        });
      }
    },
  });
}

/** POST /v1/quizzes/:id/attempts/:attemptId/violate — always finalizes as
 *  failed, so always invalidate (mirrors the answer mutation's finalize path). */
export function useViolateQuizMutation() {
  const queryClient = useQueryClient();
  const locale = useAppStore((s) => s.locale);
  return useMutation({
    mutationFn: (vars: { quizId: string; attemptId: string; courseSlug: string }) =>
      violateQuizAttempt(vars.quizId, vars.attemptId),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: contentKeys.course(vars.courseSlug, locale),
      });
      void queryClient.invalidateQueries({
        queryKey: contentKeys.sections(locale),
      });
    },
  });
}

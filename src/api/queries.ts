import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAppStore } from "../state/useAppStore";
import { authTelegram, fetchMe, updateLocale } from "./auth";
import { completeLesson, fetchCourse, fetchSections, submitQuiz } from "./courses";
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

export function useSubmitQuizMutation() {
  const queryClient = useQueryClient();
  const locale = useAppStore((s) => s.locale);
  return useMutation({
    mutationFn: (vars: {
      quizId: string;
      courseSlug: string;
      answers: number[];
    }) => submitQuiz(vars.quizId, vars.answers),
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

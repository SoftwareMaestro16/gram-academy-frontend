import { postJson, requestJson } from "./http";
import {
  courseDetailSchema,
  lessonCompleteSchema,
  sectionsResponseSchema,
  type CourseDetail,
  type LessonComplete,
  type Locale,
  type Section,
} from "./schemas";

/** GET /v1/sections?locale= — sections with nested course summaries. */
export function fetchSections(locale: Locale): Promise<Section[]> {
  return requestJson(`/v1/sections?locale=${locale}`, sectionsResponseSchema);
}

/** GET /v1/courses/:slug?locale= — full course (lessons, quizzes, progress). */
export function fetchCourse(slug: string, locale: Locale): Promise<CourseDetail> {
  return requestJson(
    `/v1/courses/${encodeURIComponent(slug)}?locale=${locale}`,
    courseDetailSchema,
  );
}

/** POST /v1/lessons/:id/complete — mark a lesson as read. */
export function completeLesson(lessonId: string): Promise<LessonComplete> {
  return postJson(
    `/v1/lessons/${encodeURIComponent(lessonId)}/complete`,
    undefined,
    lessonCompleteSchema,
  );
}

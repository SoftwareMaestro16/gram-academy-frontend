import { z } from "zod";

/**
 * Local response schemas — the client's schema home. Hand-typed from
 * MASTER-SPEC §13.5 (REST registry / MeResponse) and the canonical
 * CONTENT-DTO.md contract for `/v1/sections` and `/v1/courses/:slug` (agreed
 * with the backend; keep this file field-for-field in sync with that doc).
 *
 * Business logic (prices, discounts, serials, progress, completion) is computed
 * server-side and rendered here as-is — never derived on the client.
 *
 * NOT imported from `@gram-academy/protocol`: response schemas live here so the
 * client owns its own view of the wire contract.
 */

export const localeSchema = z.enum(["en", "ru", "zh"]);
export type Locale = z.infer<typeof localeSchema>;

// --- Auth / MeResponse (§13.5) --------------------------------------------

export const userSchema = z.object({
  telegramId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
  languageCode: z.string().nullable(),
  photoUrl: z.string().nullable(),
  isPremium: z.boolean(),
  locale: localeSchema,
});
export type User = z.infer<typeof userSchema>;

export const walletSchema = z.object({
  address: z.string(),
  network: z.enum(["testnet", "mainnet"]),
  verifiedAt: z.string(),
  proofExpiresAt: z.string(),
});
export type Wallet = z.infer<typeof walletSchema>;

export const meResponseSchema = z.object({
  user: userSchema,
  wallet: walletSchema.nullable(),
  referralCode: z.string(),
  referralLink: z.string().nullable(),
  referredByReferralCode: z.string().nullable(),
  deepLinkCourseSlug: z.string().nullable(),
});
export type MeResponse = z.infer<typeof meResponseSchema>;

// --- Certificate status ----------------------------------------------------

export const certificateStatusSchema = z.enum(["none", "reserved", "minted"]);
export type CertificateStatus = z.infer<typeof certificateStatusSchema>;

// --- Sections & course summaries (CONTENT-DTO.md: GET /v1/sections) ---------
//
// All fields are guaranteed by the server. Prices arrive pre-computed:
// `priceStars` (base) and `discountedPriceStars` (== priceStars unless the
// viewer has a referrer and the course is paid). The client renders both; it
// never computes a discount.

export const courseSummarySchema = z.object({
  slug: z.string(),
  sortOrder: z.number(),
  isPaid: z.boolean(),
  priceStars: z.number(),
  discountedPriceStars: z.number(),
  title: z.string(),
  description: z.string(),
  lessonCount: z.number(),
  quizCount: z.number(),
  isPurchased: z.boolean(),
  completedLessons: z.number(),
  completedQuizzes: z.number(),
  isCompleted: z.boolean(),
  certificate: certificateStatusSchema,
});
export type CourseSummary = z.infer<typeof courseSummarySchema>;

export const sectionSchema = z.object({
  slug: z.string(),
  sortOrder: z.number(),
  title: z.string(),
  description: z.string(),
  courses: z.array(courseSummarySchema),
});
export type Section = z.infer<typeof sectionSchema>;

export const sectionsResponseSchema = z.array(sectionSchema);

// --- Course detail (CONTENT-DTO.md: GET /v1/courses/:slug) ------------------
//
// Always 200 for an existing slug. A paid-but-unpurchased course returns
// `locked: true` with empty lessons/quizzes but full metadata (title, price,
// counts) so the client renders a purchase screen. Lessons/quizzes are ordered
// by sortOrder; the "next lesson" is derived from that order (no nextLessonId).
// Quiz questions never carry the correct answer (stripped server-side).

export const lessonDetailSchema = z.object({
  id: z.string(),
  sortOrder: z.number(),
  title: z.string(),
  body: z.string(), // markdown, pre-localized
  completed: z.boolean(),
});
export type LessonDetail = z.infer<typeof lessonDetailSchema>;

export const quizQuestionSchema = z.object({
  id: z.string(),
  sortOrder: z.number(),
  question: z.string(),
  options: z.array(z.string()),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizDetailSchema = z.object({
  id: z.string(),
  sortOrder: z.number(),
  title: z.string(),
  completed: z.boolean(),
  passed: z.boolean(),
  questions: z.array(quizQuestionSchema),
});
export type QuizDetail = z.infer<typeof quizDetailSchema>;

export const courseDetailSchema = z.object({
  slug: z.string(),
  sectionSlug: z.string(),
  isPaid: z.boolean(),
  priceStars: z.number(),
  discountedPriceStars: z.number(),
  title: z.string(),
  description: z.string(),
  lessonCount: z.number(),
  quizCount: z.number(),
  isPurchased: z.boolean(),
  isCompleted: z.boolean(),
  certificate: certificateStatusSchema,
  locked: z.boolean(),
  lessons: z.array(lessonDetailSchema),
  quizzes: z.array(quizDetailSchema),
});
export type CourseDetail = z.infer<typeof courseDetailSchema>;

// --- Mutations -------------------------------------------------------------

/** POST /v1/lessons/:id/complete → `{ ok: true }`. */
export const lessonCompleteSchema = z.object({ ok: z.boolean() });
export type LessonComplete = z.infer<typeof lessonCompleteSchema>;

/** POST /v1/quizzes/:id/submit → `{ passed, score }`. */
export const quizSubmitSchema = z.object({
  passed: z.boolean(),
  score: z.number(),
});
export type QuizSubmitResult = z.infer<typeof quizSubmitSchema>;

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

// --- Wallet ton-proof (§13.5: POST /v1/wallet/proof/challenge) -------------
//
// `verify`'s response reuses `meResponseSchema` (it returns MeResponse with
// `wallet` filled). `disconnect`'s response shape isn't pinned by the spec —
// callers refetch `me` afterwards instead of relying on its body.

export const walletProofChallengeSchema = z.object({
  payload: z.string(),
  expiresAt: z.string(),
});
export type WalletProofChallenge = z.infer<typeof walletProofChallengeSchema>;

// --- Wallet balance (GET /v1/wallet/balance, session-authenticated) --------
//
// `balanceNano` arrives as a stringified bigint (nanoton) per the wire
// convention — formatted to TON client-side, never computed. 404
// `{error:"no_wallet"}` when nothing is bound yet; callers only fetch this
// once `MeResponse.wallet` is non-null.

export const walletBalanceSchema = z.object({
  address: z.string(),
  balanceNano: z.string(),
});
export type WalletBalance = z.infer<typeof walletBalanceSchema>;

// --- Referrals (docs/08 §6: GET /v1/referrals/my) ---------------------------
//
// `referralLink` is null until a wallet is connected (server-computed).
// `earnedTonNano` arrives as a stringified bigint (nanoton) per the wire
// convention — formatted to TON client-side, never computed. Matches
// server/api/src/modules/referrals/service.ts's `ReferralStats` exactly —
// it does not compute a `referralCode` or `conversionPct` (neither is
// rendered anywhere in this app), so this schema must not require them.

export const referralsSchema = z.object({
  referralLink: z.string().nullable(),
  invitedCount: z.number(),
  referralsWithWallet: z.number(),
  mintedByReferrals: z.number(),
  earnedTonNano: z.string(),
});
export type Referrals = z.infer<typeof referralsSchema>;

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
  // QUIZ-INTEGRITY.md: ISO timestamp of the 1h cooldown from the latest
  // failed attempt, or null when not in cooldown. Lets the client show
  // "available at HH:MM" without a failed /start round-trip.
  cooldownUntil: z.string().nullable(),
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

// --- Quiz attempts (QUIZ-INTEGRITY.md) --------------------------------------
//
// Replaces the old `POST /v1/quizzes/:id/submit { answers } -> { passed, score }`
// (removed). Questions are revealed one at a time by the server, each starting
// its own 30s clock server-side at the moment it's sent. Grading, timing,
// shuffling, and cooldown are entirely server-authoritative — the client never
// sees `correctIndex` and never decides pass/fail itself.

export const quizQuestionRevealSchema = z.object({
  index: z.number(),
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
});
export type QuizQuestionReveal = z.infer<typeof quizQuestionRevealSchema>;

/** POST /v1/quizzes/:id/start */
export const quizStartResponseSchema = z.object({
  attemptId: z.string(),
  totalQuestions: z.number(),
  questionTimeLimitSeconds: z.number(),
  question: quizQuestionRevealSchema,
});
export type QuizStartResponse = z.infer<typeof quizStartResponseSchema>;

/** POST /v1/quizzes/:id/attempts/:attemptId/answer `{ questionIndex, selectedOption }` */
export const quizAnswerResponseSchema = z.discriminatedUnion("done", [
  z.object({ done: z.literal(false), question: quizQuestionRevealSchema }),
  z.object({
    done: z.literal(true),
    passed: z.boolean(),
    score: z.number(),
    retryAfterSeconds: z.number().nullable(),
  }),
]);
export type QuizAnswerResponse = z.infer<typeof quizAnswerResponseSchema>;

/** POST /v1/quizzes/:id/attempts/:attemptId/violate `{ reason: "backgrounded" }`.
 *  Finalizes the attempt immediately as failed — same effect as a timeout. */
export const quizViolateResponseSchema = z.object({
  passed: z.literal(false),
  score: z.number(),
  retryAfterSeconds: z.number(),
});
export type QuizViolateResponse = z.infer<typeof quizViolateResponseSchema>;

// --- Certificate mint (master-spec §13.5/§13.6) -----------------------------
//
// POST /v1/certificates/mint-intent -> MintIntentDto. The client relays this
// as-is to TON Connect (`lib/mintTx.ts`) — it never inspects or recomputes
// `payloadBase64`/`amountNano`. Idempotent while a non-expired RESERVED
// record exists for the course (same serial/signature returned on repeat
// calls); errors: 403 course_not_completed, 409 already_minted,
// 409 wallet_required.

export const mintIntentSchema = z.object({
  collectionAddress: z.string(),
  itemAddress: z.string(),
  tokenName: z.string(),
  serial: z.number(),
  amountNano: z.string(),
  payloadBase64: z.string(),
  validUntil: z.number(),
});
export type MintIntentDto = z.infer<typeof mintIntentSchema>;

/** GET /v1/certificates/my — one row per reservation/mint on the caller's
 *  account, across all courses. `status` is the on-chain-confirmation state
 *  machine (distinct from `CourseDetail.certificate`, which only summarizes
 *  the single course being viewed). The client polls this until the row
 *  matching a fresh mint's `tokenName` reaches CONFIRMED. */
export const certificateMintStatusSchema = z.enum(["RESERVED", "CONFIRMED", "EXPIRED"]);
export type CertificateMintStatus = z.infer<typeof certificateMintStatusSchema>;

export const certificateMintSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  serial: z.number(),
  tokenName: z.string(),
  status: certificateMintStatusSchema,
  itemAddress: z.string(),
  confirmedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type CertificateMint = z.infer<typeof certificateMintSchema>;

export const certificatesMyResponseSchema = z.array(certificateMintSchema);

/** GET /v1/certificates/stats — gamification stat for the Certificates
 *  screen. `percentile` means "the caller has as many-or-more CONFIRMED
 *  certificates than `percentile`% of all users" — higher is better; render
 *  as "top N%" via `100 - percentile`. */
export const certificateStatsSchema = z.object({
  myCount: z.number(),
  totalUsers: z.number(),
  percentile: z.number(),
});
export type CertificateStats = z.infer<typeof certificateStatsSchema>;

// --- Stars purchase (master-spec §13.5) -------------------------------------

/** POST /v1/courses/:slug/purchase-invoice -> `{ invoiceLink }`, opened via
 *  `Telegram.WebApp.openInvoice`. Errors: 409 already_purchased,
 *  400 course_not_paid. */
export const purchaseInvoiceResponseSchema = z.object({
  invoiceLink: z.string(),
});
export type PurchaseInvoiceResponse = z.infer<typeof purchaseInvoiceResponseSchema>;

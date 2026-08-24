import { useState } from "react";
import {
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  Play,
  RotateCcw,
} from "lucide-react";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { MetaRow } from "../../components/MetaRow";
import { PriceTag } from "../../components/PriceTag";
import { StarsLabel } from "../../components/StarsIcon";
import { ProgressBar } from "../../components/ProgressBar";
import { RoadmapList } from "../../components/RoadmapList";
import { ErrorCard, SkeletonList, Spinner } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { useCertificatesMyQuery } from "../../api/certificates";
import { requestPurchaseInvoice } from "../../api/payments";
import { useCourseQuery, useMe } from "../../api/queries";
import { durationParts } from "../../lib/formatDuration";
import { notificationHaptic, openTelegramInvoice } from "../../lib/telegram";
import { useAppStore, type AppView } from "../../state/useAppStore";
import { MintFlow } from "./MintFlow";
import { certExplorerUrl, findCourseCertificate } from "./certLink";
import type { CourseDetail, Wallet } from "../../api/schemas";

// --- Stars purchase flow (docs/05-frontend-spec.md §5) ----------------------

type PurchasePhase =
  | { name: "idle" }
  | { name: "opening" } // POST purchase-invoice in flight
  | { name: "confirming" } // invoice paid/pending; polling course detail for locked:false
  | { name: "cancelled" }
  | { name: "failed" };

function PurchaseFlow({
  course,
  refetchCourse,
}: {
  course: CourseDetail;
  refetchCourse: () => Promise<{ data?: CourseDetail | undefined }>;
}) {
  const { t } = useT();
  const [phase, setPhase] = useState<PurchasePhase>({ name: "idle" });

  const pollUntilUnlocked = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await refetchCourse();
      if (result.data && !result.data.locked) return true;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    return false;
  };

  const handleBuy = async () => {
    setPhase({ name: "opening" });
    let invoiceLink: string;
    try {
      ({ invoiceLink } = await requestPurchaseInvoice(course.slug));
    } catch {
      notificationHaptic("error");
      setPhase({ name: "failed" });
      return;
    }
    setPhase({ name: "confirming" });
    openTelegramInvoice(invoiceLink, (status) => {
      if (status === "paid" || status === "pending") {
        notificationHaptic("success");
        void pollUntilUnlocked().then((unlocked) => {
          // Webhook may still be lagging after the retries above — leave the
          // soft "confirming" message rather than a hard failure; the next
          // natural refetch of this screen will pick it up.
          setPhase(unlocked ? { name: "idle" } : { name: "confirming" });
        });
      } else if (status === "cancelled") {
        setPhase({ name: "cancelled" });
      } else {
        notificationHaptic("error");
        setPhase({ name: "failed" });
      }
    });
  };

  const pending = phase.name === "opening" || phase.name === "confirming";

  return (
    <div>
      <Button variant="primary" fullWidth size="lg" disabled={pending} onClick={() => void handleBuy()}>
        {pending ? <Spinner className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        <StarsLabel template={t.course.buy} vars={{ n: course.discountedPriceStars }} />
      </Button>
      {phase.name === "opening" && (
        <p className="mt-2 text-center text-xs text-text-muted">{t.purchase.opening}</p>
      )}
      {phase.name === "confirming" && (
        <p className="mt-2 text-center text-xs text-text-muted">{t.purchase.confirming}</p>
      )}
      {(phase.name === "cancelled" || phase.name === "failed") && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-text-muted">
          <span>{phase.name === "cancelled" ? t.purchase.cancelled : t.purchase.failed}</span>
          <button
            type="button"
            className="font-medium text-accent underline underline-offset-2"
            onClick={() => setPhase({ name: "idle" })}
          >
            {t.purchase.dismiss}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Completed-course actions (View Certificate + Review) -------------------
//
// The mint button now lives at the end of the quiz (§4); the course page's job
// once completed is View Certificate / Review. If the course is completed but
// not yet minted (e.g. the user left before minting), the mint CTA still lives
// here as a fallback so they're never stranded — reusing the shared MintFlow.

function CompletedActions({
  course,
  wallet,
  onReview,
  onGoToProfile,
}: {
  course: CourseDetail;
  wallet: Wallet | null | undefined;
  onReview: () => void;
  onGoToProfile: () => void;
}) {
  const { t } = useT();
  const { data: myCertificates } = useCertificatesMyQuery();
  const confirmedCert = findCourseCertificate(myCertificates, course.slug, "CONFIRMED");

  return (
    <div className="space-y-2.5">
      {confirmedCert ? (
        <a
          href={certExplorerUrl(confirmedCert.itemAddress)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover active:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          {t.course.certificateMinted}
        </a>
      ) : (
        // Completed but not minted yet — keep minting reachable from here.
        <MintFlow
          course={course}
          wallet={wallet}
          onGoToProfile={onGoToProfile}
          ctaLabel={t.mint.mintCta}
        />
      )}
      <Button variant="secondary" fullWidth size="lg" onClick={onReview}>
        <RotateCcw className="h-4 w-4" />
        {t.course.reviewCourse}
      </Button>
    </div>
  );
}

// --- Contextual primary action (DESIGN.md §Course detail) -------------------

function CtaBlock({
  course,
  wallet,
  onStart,
  onReview,
  onGoToProfile,
  refetchCourse,
}: {
  course: CourseDetail;
  wallet: Wallet | null | undefined;
  onStart: () => void;
  onReview: () => void;
  onGoToProfile: () => void;
  refetchCourse: () => Promise<{ data?: CourseDetail | undefined }>;
}) {
  const { t } = useT();

  if (course.locked) {
    return <PurchaseFlow course={course} refetchCourse={refetchCourse} />;
  }

  if (course.isCompleted) {
    return (
      <CompletedActions
        course={course}
        wallet={wallet}
        onReview={onReview}
        onGoToProfile={onGoToProfile}
      />
    );
  }

  const started = course.lessons.some((l) => l.completed);
  return (
    <Button variant="primary" fullWidth size="lg" onClick={onStart}>
      <Play className="h-4 w-4" />
      {started ? t.course.continueLearning : t.course.startCourse}
    </Button>
  );
}

/** Localized whole-course duration chip (e.g. "2.5 hr"); omitted when the
 *  server hasn't provided `estimatedMinutes` yet. */
function durationMeta(
  course: CourseDetail,
  t: ReturnType<typeof useT>["t"],
): string | null {
  if (course.estimatedMinutes === undefined) return null;
  const parts = durationParts(course.estimatedMinutes);
  if (!parts) return null;
  const template = parts.unit === "hours" ? t.course.durationHours : t.course.durationMinutes;
  return format(template, { n: parts.value });
}

export function CourseScreen({ slug }: { slug: string }) {
  const { t } = useT();
  const goBack = useAppStore((s) => s.goBack);
  const setView = useAppStore((s) => s.setView);
  const setTab = useAppStore((s) => s.setTab);
  const { data: course, isPending, isError, refetch } = useCourseQuery(slug);
  const { data: me } = useMe();

  if (isPending) {
    return (
      <Screen onBack={goBack} withTabBar>
        <SkeletonList rows={4} />
      </Screen>
    );
  }
  if (isError || !course) {
    return (
      <Screen onBack={goBack} withTabBar>
        <ErrorCard onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const completedLessons = course.lessons.filter((l) => l.completed).length;
  const started = completedLessons > 0;

  // The first lesson to open when starting/continuing (first incomplete, else
  // the very first); Review always re-enters from the first lesson.
  const openLesson = (lessonId: string) =>
    setView({ name: "lesson", courseSlug: slug, lessonId });

  const onStart = () => {
    const next = course.lessons.find((l) => !l.completed) ?? course.lessons[0];
    if (next) {
      openLesson(next.id);
      return;
    }
    const firstQuiz = course.quizzes[0];
    if (firstQuiz) setView({ name: "quiz", courseSlug: slug, quizId: firstQuiz.id });
  };

  const onReview = () => {
    const first = course.lessons[0];
    if (first) openLesson(first.id);
  };

  const openView = (view: AppView) => setView(view);

  return (
    <Screen onBack={goBack} withTabBar>
      <h1 className="text-[28px] font-bold leading-tight">{course.title}</h1>

      {course.description && (
        <p className="mt-2 text-text-muted">{course.description}</p>
      )}

      <MetaRow
        className="mt-3"
        items={[
          format(t.section.lessons, { n: course.lessonCount }),
          durationMeta(course, t),
          format(t.section.quizzes, { n: course.quizCount }),
          <PriceTag
            key="price"
            isPaid={course.isPaid}
            priceStars={course.priceStars}
            discountedPriceStars={course.discountedPriceStars}
          />,
          <span key="cert" className="inline-flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            {t.course.certificateMeta}
          </span>,
        ]}
      />

      {!course.locked && started && !course.isCompleted && (
        <div className="mt-4">
          <ProgressBar value={completedLessons} max={course.lessonCount} />
          <p className="mt-1 text-xs text-text-muted">
            {format(t.section.progress, {
              done: completedLessons,
              total: course.lessonCount,
            })}
          </p>
        </div>
      )}

      <div className="mt-5">
        <CtaBlock
          course={course}
          wallet={me?.wallet}
          onStart={onStart}
          onReview={onReview}
          onGoToProfile={() => setTab("profile")}
          refetchCourse={refetch}
        />
      </div>

      {course.locked ? (
        <Card className="mt-4 xs:mt-7">
          <h2 className="text-sm font-semibold text-text-muted">
            {t.course.whatsInside}
          </h2>
          <MetaRow
            className="mt-2"
            items={[
              <span key="l" className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {format(t.section.lessons, { n: course.lessonCount })}
              </span>,
              <span key="q" className="inline-flex items-center gap-1">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {format(t.section.quizzes, { n: course.quizCount })}
              </span>,
              t.course.certificateMeta,
            ]}
          />
        </Card>
      ) : started || course.isCompleted ? (
        // In progress or done: the interactive checklist (jump to any lesson /
        // the final quiz), with completion state.
        <section className="mt-4 xs:mt-7">
          <h2 className="mb-2 text-sm font-semibold text-text-muted">
            {t.course.roadmap}
          </h2>
          <RoadmapList
            lessons={course.lessons}
            quizzes={course.quizzes}
            onSelectLesson={(id) => openView({ name: "lesson", courseSlug: slug, lessonId: id })}
            onSelectQuiz={(id) => openView({ name: "quiz", courseSlug: slug, quizId: id })}
          />
        </section>
      ) : (
        course.lessons.length > 0 && (
          // Not started yet: an aspirational "What you'll learn" outline derived
          // generically from the lesson titles (no per-course content).
          <section className="mt-4 xs:mt-7">
            <h2 className="mb-2 text-sm font-semibold text-text-muted">
              {t.course.whatYouLearn}
            </h2>
            <Card>
              <ul className="space-y-2.5">
                {course.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-start gap-2.5 text-sm">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )
      )}
    </Screen>
  );
}

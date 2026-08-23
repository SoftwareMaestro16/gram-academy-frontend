import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTonConnectUI, UserRejectsError, WalletNotConnectedError } from "@tonconnect/ui-react";
import {
  Award,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Lock,
  Play,
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
import { certificateKeys, requestMintIntent, useCertificatesMyQuery } from "../../api/certificates";
import { requestPurchaseInvoice } from "../../api/payments";
import { contentKeys, useCourseQuery, useMe } from "../../api/queries";
import { ApiError } from "../../api/http";
import { buildMintTransaction } from "../../lib/mintTx";
import { useWalletProof } from "../../lib/useWalletProof";
import { impactHaptic, notificationHaptic, openTelegramInvoice } from "../../lib/telegram";
import { useAppStore, type AppView } from "../../state/useAppStore";
import type { CertificateMint, CourseDetail, MintIntentDto, Wallet } from "../../api/schemas";

// --- Certificate mint flow (docs/05-frontend-spec.md §4.2) ------------------
//
// The client holds zero mint business logic: `amountNano`/`payloadBase64`
// are relayed to TON Connect as-is. A mint is successful ONLY once
// `GET /v1/certificates/my` reports the matching row CONFIRMED — never on
// `sendTransaction` resolving. `pendingRecord`/`confirmedRecord` below are
// derived live from that poll, so this also transparently "resumes" a
// reservation that was created in an earlier session (no local state to
// reconstruct — the server row is the only truth).
type MintPhase =
  | { name: "idle" }
  | { name: "requesting" } // POST mint-intent in flight
  | { name: "awaitingWallet" } // sendTransaction awaiting the wallet's approval
  | { name: "waiting"; intent: MintIntentDto } // tx submitted; poll until CONFIRMED or intent.validUntil passes
  | { name: "rejected" } // user declined in the wallet
  | { name: "expired" } // reservation's validUntil passed with no confirmation
  | { name: "error"; code?: string | undefined };

function MintedView({ record }: { record: CertificateMint }) {
  const { t } = useT();
  return (
    <div className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent">
      <div className="flex items-center gap-2 font-medium">
        <Award className="h-4 w-4" />
        {t.mint.confirmedTitle}
      </div>
      <p className="mt-1 text-text-muted">{format(t.mint.serial, { n: record.serial })}</p>
      <a
        href={`https://testnet.tonviewer.com/${record.itemAddress}`}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 font-medium text-accent underline underline-offset-2"
      >
        {t.mint.viewExplorer}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function MintFlow({
  course,
  wallet,
  onGoToProfile,
}: {
  course: CourseDetail;
  /** `undefined` = the `me` query hasn't resolved yet; `null` = no wallet. */
  wallet: Wallet | null | undefined;
  onGoToProfile: () => void;
}) {
  const { t, c } = useT();
  const locale = useAppStore((s) => s.locale);
  const queryClient = useQueryClient();
  const [tonConnectUI] = useTonConnectUI();
  const { data: myCertificates } = useCertificatesMyQuery();
  const { connect: connectWallet, isBusy: isWalletConnecting } = useWalletProof();
  const [phase, setPhase] = useState<MintPhase>({ name: "idle" });

  // Rows for THIS course, keyed by the `<course-slug>-<serial>` tokenName
  // convention (master-spec §13.6) — no courseId plumbing needed client-side.
  const confirmedRecord = myCertificates?.find(
    (c) => c.status === "CONFIRMED" && c.tokenName.startsWith(`${course.slug}-`),
  );
  const pendingRecord = myCertificates?.find(
    (c) => c.status === "RESERVED" && c.tokenName.startsWith(`${course.slug}-`),
  );

  // Fire once per confirmation: haptic + refresh the course/sections queries
  // so `CourseDetail.certificate`/`CourseSummary.certificate` catch up too.
  const notifiedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!confirmedRecord || notifiedIdRef.current === confirmedRecord.id) return;
    notifiedIdRef.current = confirmedRecord.id;
    impactHaptic("light");
    void queryClient.invalidateQueries({ queryKey: contentKeys.course(course.slug, locale) });
    void queryClient.invalidateQueries({ queryKey: contentKeys.sections(locale) });
  }, [confirmedRecord, course.slug, locale, queryClient]);

  // Only a reservation started THIS session carries a known `validUntil`
  // locally — that's what lets us offer "try again" instead of waiting
  // forever on a reservation the server hasn't (yet) marked EXPIRED.
  useEffect(() => {
    if (phase.name !== "waiting" || confirmedRecord) return;
    if (Date.now() / 1000 > phase.intent.validUntil) {
      setPhase({ name: "expired" });
    }
  }, [phase, confirmedRecord]);

  const handleMint = async () => {
    setPhase({ name: "requesting" });
    let intent: MintIntentDto;
    try {
      intent = await requestMintIntent(course.slug);
    } catch (err) {
      setPhase({ name: "error", code: err instanceof ApiError ? err.code : undefined });
      return;
    }
    // The reservation exists server-side now (idempotently) — refresh /my
    // immediately so the 5s poll picks it up without waiting on stale cache.
    void queryClient.invalidateQueries({ queryKey: certificateKeys.my });
    setPhase({ name: "awaitingWallet" });
    try {
      await tonConnectUI.sendTransaction(buildMintTransaction(intent));
    } catch (err) {
      if (err instanceof UserRejectsError) {
        impactHaptic("light");
        setPhase({ name: "rejected" });
        return;
      }
      setPhase({
        name: "error",
        code: err instanceof WalletNotConnectedError ? "wallet_required" : undefined,
      });
      return;
    }
    // Critical: sendTransaction resolving only means the wallet broadcast the
    // message — NOT that the mint succeeded. Only the /my poll below decides that.
    setPhase({ name: "waiting", intent });
  };

  if (confirmedRecord) {
    return <MintedView record={confirmedRecord} />;
  }

  if (pendingRecord || phase.name === "waiting") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
        <Spinner className="h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium text-text">{t.mint.waitingTitle}</p>
          <p className="text-text-muted">{t.mint.waitingBody}</p>
        </div>
      </div>
    );
  }

  if (phase.name === "rejected" || phase.name === "expired") {
    return (
      <div>
        <p className="mb-2 text-sm text-text-muted">
          {phase.name === "rejected" ? t.mint.rejected : t.mint.pending}
        </p>
        <Button variant="primary" fullWidth onClick={() => void handleMint()}>
          <Award className="h-4 w-4" />
          {t.mint.tryAgain}
        </Button>
      </div>
    );
  }

  if (phase.name === "error") {
    const message =
      phase.code === "already_minted"
        ? t.mint.errorAlreadyMinted
        : phase.code === "course_not_completed"
          ? t.mint.errorNotCompleted
          : phase.code === "wallet_required"
            ? t.mint.errorWalletRequired
            : t.error.generic;
    return (
      <div>
        <p className="mb-2 text-sm text-danger">{message}</p>
        <Button variant="primary" fullWidth onClick={() => void handleMint()}>
          <Award className="h-4 w-4" />
          {t.mint.tryAgain}
        </Button>
      </div>
    );
  }

  if (wallet === undefined) {
    // `me` hasn't resolved yet — avoid flashing the "connect a wallet" prompt.
    return (
      <Button variant="primary" fullWidth disabled>
        <Spinner className="h-4 w-4" />
        {t.course.getCertificate}
      </Button>
    );
  }

  if (wallet === null) {
    return (
      <div>
        <p className="mb-2 text-center text-xs text-text-muted">{t.mint.walletRequired}</p>
        <Button
          variant="primary"
          fullWidth
          disabled={isWalletConnecting}
          onClick={() => void connectWallet()}
        >
          {isWalletConnecting ? <Spinner className="h-4 w-4" /> : <Award className="h-4 w-4" />}
          {c.wallet.connect}
        </Button>
        <Button variant="ghost" fullWidth className="mt-1" onClick={onGoToProfile}>
          {t.mint.goToProfile}
        </Button>
      </div>
    );
  }

  const pending = phase.name === "requesting" || phase.name === "awaitingWallet";
  return (
    <Button variant="primary" fullWidth disabled={pending} onClick={() => void handleMint()}>
      {pending ? <Spinner className="h-4 w-4" /> : <Award className="h-4 w-4" />}
      {t.course.getCertificate}
    </Button>
  );
}

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
      <Button variant="primary" fullWidth disabled={pending} onClick={() => void handleBuy()}>
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

// --- Contextual primary action (DESIGN.md §Course detail) -------------------

function CtaBlock({
  course,
  wallet,
  onOpenTarget,
  onGoToProfile,
  refetchCourse,
}: {
  course: CourseDetail;
  wallet: Wallet | null | undefined;
  onOpenTarget: () => void;
  onGoToProfile: () => void;
  refetchCourse: () => Promise<{ data?: CourseDetail | undefined }>;
}) {
  const { t } = useT();

  if (course.locked) {
    return <PurchaseFlow course={course} refetchCourse={refetchCourse} />;
  }

  if (course.isCompleted) {
    return <MintFlow course={course} wallet={wallet} onGoToProfile={onGoToProfile} />;
  }

  const started = course.lessons.some((l) => l.completed);
  return (
    <Button variant="primary" fullWidth onClick={onOpenTarget}>
      <Play className="h-4 w-4" />
      {started ? t.course.continueLearning : t.course.start}
    </Button>
  );
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

  const openTarget = () => {
    const nextLesson =
      course.lessons.find((l) => !l.completed) ?? course.lessons[0];
    if (nextLesson) {
      setView({ name: "lesson", courseSlug: slug, lessonId: nextLesson.id });
      return;
    }
    const firstQuiz = course.quizzes[0];
    if (firstQuiz) {
      setView({ name: "quiz", courseSlug: slug, quizId: firstQuiz.id });
    }
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
          format(t.section.quizzes, { n: course.quizCount }),
          <PriceTag
            key="price"
            isPaid={course.isPaid}
            priceStars={course.priceStars}
            discountedPriceStars={course.discountedPriceStars}
          />,
          t.course.certificateMeta,
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
          onOpenTarget={openTarget}
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
      ) : (
        <section className="mt-4 xs:mt-7">
          <h2 className="mb-2 text-sm font-semibold text-text-muted">
            {t.course.roadmap}
          </h2>
          <RoadmapList
            lessons={course.lessons}
            quizzes={course.quizzes}
            onSelectLesson={(id) =>
              openView({ name: "lesson", courseSlug: slug, lessonId: id })
            }
            onSelectQuiz={(id) =>
              openView({ name: "quiz", courseSlug: slug, quizId: id })
            }
          />
        </section>
      )}
    </Screen>
  );
}

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTonConnectUI, UserRejectsError, WalletNotConnectedError } from "@tonconnect/ui-react";
import { Award, ExternalLink } from "lucide-react";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { format } from "../../i18n/strings";
import { certificateKeys, requestMintIntent, useCertificatesMyQuery } from "../../api/certificates";
import { contentKeys } from "../../api/queries";
import { ApiError } from "../../api/http";
import { buildMintTransaction } from "../../lib/mintTx";
import { useWalletProof } from "../../lib/useWalletProof";
import { impactHaptic } from "../../lib/telegram";
import { useAppStore } from "../../state/useAppStore";
import { certExplorerUrl, findCourseCertificate } from "./certLink";
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
//
// This component is shared: it is the course page's completed-course mint CTA
// AND the button shown at the very end of a passed quiz (§4).
type MintPhase =
  | { name: "idle" }
  | { name: "requesting" } // POST mint-intent in flight
  | { name: "awaitingWallet" } // sendTransaction awaiting the wallet's approval
  | { name: "waiting"; intent: MintIntentDto } // tx submitted; poll until CONFIRMED or intent.validUntil passes
  | { name: "rejected" } // user declined in the wallet
  | { name: "expired" } // reservation's validUntil passed with no confirmation
  | { name: "error"; code?: string | undefined };

export function MintedView({ record }: { record: CertificateMint }) {
  const { t } = useT();
  return (
    <div className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent">
      <div className="flex items-center gap-2 font-medium">
        <Award className="h-4 w-4" />
        {t.mint.confirmedTitle}
      </div>
      <p className="mt-1 text-text-muted">{format(t.mint.serial, { n: record.serial })}</p>
      <a
        href={certExplorerUrl(record.itemAddress)}
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

export function MintFlow({
  course,
  wallet,
  onGoToProfile,
  /** Overrides the primary CTA label (defaults to "Get certificate"; the quiz
   *  end passes "Mint Certificate"). */
  ctaLabel,
}: {
  course: CourseDetail;
  /** `undefined` = the `me` query hasn't resolved yet; `null` = no wallet. */
  wallet: Wallet | null | undefined;
  onGoToProfile: () => void;
  ctaLabel?: string;
}) {
  const { t, c } = useT();
  const locale = useAppStore((s) => s.locale);
  const queryClient = useQueryClient();
  const [tonConnectUI] = useTonConnectUI();
  const { data: myCertificates } = useCertificatesMyQuery();
  const { connect: connectWallet, isBusy: isWalletConnecting } = useWalletProof();
  const [phase, setPhase] = useState<MintPhase>({ name: "idle" });

  const label = ctaLabel ?? t.course.getCertificate;

  // Rows for THIS course, keyed by the `<course-slug>-<serial>` tokenName
  // convention (master-spec §13.6) — no courseId plumbing needed client-side.
  const confirmedRecord = findCourseCertificate(myCertificates, course.slug, "CONFIRMED");
  const pendingRecord = findCourseCertificate(myCertificates, course.slug, "RESERVED");

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
        {label}
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
    <Button variant="primary" fullWidth size="lg" disabled={pending} onClick={() => void handleMint()}>
      {pending ? <Spinner className="h-4 w-4" /> : <Award className="h-4 w-4" />}
      {label}
    </Button>
  );
}

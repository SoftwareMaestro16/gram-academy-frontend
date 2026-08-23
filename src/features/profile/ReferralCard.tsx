import { useState } from "react";
import { Check, Copy, Share2, Users } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { useReferralsQuery } from "../../api/referrals";
import type { Referrals } from "../../api/schemas";
import { impactHaptic, switchInlineQuery } from "../../lib/telegram";

/** Formats a stringified nanoton amount (wire convention: bigint-as-string)
 *  as TON, 2-4 decimals, trailing zeros trimmed to a minimum of 2. Never
 *  computed for business logic — display only, the server owns the totals. */
function formatTon(nanoTonString: string): string {
  const value = Number(nanoTonString) / 1_000_000_000;
  if (!Number.isFinite(value)) return "0.00";
  const fixed = value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  const decimals = fixed.includes(".") ? fixed.split(".")[1]?.length ?? 0 : 0;
  return decimals < 2 ? value.toFixed(2) : fixed;
}

function TeaserCard() {
  const { t } = useT();
  return (
    <Card>
      <div className="flex items-center gap-2 font-medium">
        <span className="text-text-muted">
          <Users className="h-4 w-4" />
        </span>
        {t.profile.referral}
      </div>
      <p className="mt-1 text-sm text-text-muted">{t.referral.teaser}</p>
    </Card>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

function ConnectedReferralCard({ data }: { data: Referrals }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const link = data.referralLink;
  if (link === null) return <TeaserCard />;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      impactHaptic("light");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — button simply won't confirm */
    }
  };

  const handleShare = async () => {
    // Prefer Telegram's native inline-share compose box (bot renders the
    // card); fall back to the Web Share API; last resort is a plain copy.
    if (switchInlineQuery("invite", ["users", "groups", "channels"])) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url: link });
      } catch {
        /* user cancelled the share sheet — ignore */
      }
      return;
    }
    void handleCopy();
  };

  return (
    <Card>
      <div className="flex items-center gap-2 font-medium">
        <span className="text-text-muted">
          <Users className="h-4 w-4" />
        </span>
        {t.profile.referral}
      </div>

      <div className="mt-3 truncate rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-text">
        {link}
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => void handleCopy()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t.referral.copied : t.referral.copy}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => void handleShare()}>
          <Share2 className="h-4 w-4" />
          {t.referral.share}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatTile label={t.referral.invited} value={data.invitedCount} />
        <StatTile label={t.referral.walletsConnected} value={data.referralsWithWallet} />
        <StatTile label={t.referral.minted} value={data.mintedByReferrals} />
        <StatTile label={t.referral.earned} value={`${formatTon(data.earnedTonNano)} TON`} />
      </div>
    </Card>
  );
}

export function ReferralCard({ hasWallet }: { hasWallet: boolean }) {
  const { data, isPending, isError, refetch } = useReferralsQuery(hasWallet);

  if (!hasWallet) return <TeaserCard />;
  if (isPending) return <SkeletonList rows={1} />;
  if (isError || !data) {
    return (
      <Card>
        <ErrorCard onRetry={() => void refetch()} />
      </Card>
    );
  }
  return <ConnectedReferralCard data={data} />;
}

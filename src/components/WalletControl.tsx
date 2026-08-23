import { useEffect, useRef, useState } from "react";
import { Check, Copy, LogOut, Wallet } from "lucide-react";
import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";
import { useMe } from "../api/queries";
import { useWalletBalanceQuery } from "../api/wallet";
import { useWalletProof } from "../lib/useWalletProof";
import { impactHaptic } from "../lib/telegram";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { GramMark } from "./Logo";
import { Spinner } from "./StateViews";

/** `UQAb…9f3Y`-style shortened display, mirrored from
 *  `ProfileScreen.tsx`'s `shortenAddress()` for a consistent shortened form
 *  across the app — never used for anything but rendering. */
function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/** Mirrors `ReferralCard.tsx`'s local `formatTon()` — a stringified nanoton
 *  amount (wire convention: bigint-as-string) as TON, 2-4 decimals, trailing
 *  zeros trimmed to a minimum of 2. Display only, never business logic. */
function formatTon(nanoTonString: string): string {
  const value = Number(nanoTonString) / 1_000_000_000;
  if (!Number.isFinite(value)) return "0.00";
  const fixed = value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  const decimals = fixed.includes(".") ? fixed.split(".")[1]?.length ?? 0 : 0;
  return decimals < 2 ? value.toFixed(2) : fixed;
}

/**
 * Header wallet control (replaces the old header ThemeToggle — that setting
 * now lives only in Profile). Disconnected: tapping starts `useWalletProof`'s
 * connect flow directly. Connected: tapping opens a small popover (address,
 * live balance, copy, disconnect) — this codebase has no dropdown primitive,
 * so it's just a local `open` state + outside-click/Escape close, anchored
 * under the button.
 */
export function WalletControl({ className }: { className?: string }) {
  const { t, c } = useT();
  const { data: me } = useMe();
  const wallet = me?.wallet ?? null;
  const { status, error, isBusy, connect, disconnect } = useWalletProof();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const balanceQuery = useWalletBalanceQuery(open && wallet !== null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // A disconnect (from here or from ProfileScreen's WalletCard) should close
  // any open popover instead of leaving it dangling with no wallet to show.
  useEffect(() => {
    if (!wallet) setOpen(false);
  }, [wallet]);

  const handleCopy = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      impactHaptic("light");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — button simply won't confirm */
    }
  };

  const handleDisconnect = () => {
    setOpen(false);
    void disconnect();
  };

  if (!wallet) {
    // Sub-phase status (challenge fetch -> wallet handshake -> server
    // verify) is surfaced via the label + a spinner so the 2-3s pause reads
    // as "working", not "frozen" (real user feedback after live testing).
    const busyLabel = status === "verifying" ? t.wallet.verifying : t.wallet.connecting;
    return (
      <button
        type="button"
        onClick={() => void connect()}
        disabled={isBusy}
        title={error ? c.common.error : undefined}
        className={cn(
          "inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm font-medium text-text transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-70",
          className,
        )}
      >
        {isBusy ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : (
          <Wallet className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">
          {isBusy ? busyLabel : c.wallet.connect}
        </span>
        <span className="sm:hidden">{isBusy ? busyLabel : t.wallet.connectShort}</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm font-medium text-text transition-colors duration-150 hover:bg-surface-2"
      >
        <Wallet className="h-3.5 w-3.5 text-accent" />
        <span className="font-mono">{shortenAddress(wallet.address)}</span>
      </button>

      {open && (
        <Card className="absolute right-0 top-[calc(100%+8px)] z-40 w-64">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm text-text">
              {shortenAddress(wallet.address)}
            </span>
            <Badge tone={wallet.network === "mainnet" ? "accent" : "neutral"}>
              {wallet.network === "mainnet" ? t.wallet.mainnet : t.wallet.testnet}
            </Badge>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
              {t.wallet.balance}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold text-text">
              {balanceQuery.isPending ? (
                <Spinner className="h-5 w-5" />
              ) : balanceQuery.data ? (
                <>
                  {formatTon(balanceQuery.data.balanceNano)}
                  <GramMark className="h-4" />
                </>
              ) : (
                "—"
              )}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              className="w-1/5 shrink-0 px-0"
              title={copied ? t.wallet.copied : t.wallet.copyAddress}
              onClick={() => void handleCopy()}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleDisconnect}
              disabled={isBusy}
            >
              <LogOut className="h-4 w-4" />
              {c.wallet.disconnect}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

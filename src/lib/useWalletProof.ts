import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CHAIN,
  useIsConnectionRestored,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { authKeys } from "../api/queries";
import {
  disconnectWalletBinding,
  fetchWalletProofChallenge,
  verifyWalletProof,
} from "../api/wallet";

/**
 * TonConnect + ton-proof wallet binding (docs/05-frontend-spec.md §4.1).
 *
 * Flow: `connect()` fetches a fresh challenge from the server, hands the
 * payload to TonConnect via `setConnectRequestParameters` so the wallet
 * signs it during the connect handshake, then opens the picker modal. Once
 * the wallet reports back (via `useTonWallet()`) with a
 * `connectItems.tonProof` reply, the effect below posts it to
 * `/v1/wallet/proof/verify` and refreshes the cached `MeResponse`.
 *
 * Restored sessions (`restoreConnection` on the provider) are deliberately
 * ignored here — a restored connection carries no fresh `tonProof` reply,
 * and the server's `MeResponse.wallet` (not the raw TonConnect wallet
 * object) is the source of truth for "is a wallet connected" throughout the
 * UI, matching the app's server-authoritative pattern for mint status.
 */

export type WalletProofStatus =
  | "idle"
  | "connecting"
  | "verifying"
  | "disconnecting";

export type WalletProofErrorCode =
  | "challenge_failed"
  | "proof_declined"
  | "verify_failed"
  | "disconnect_failed";

export function useWalletProof() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const isConnectionRestored = useIsConnectionRestored();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<WalletProofStatus>("idle");
  const [error, setError] = useState<WalletProofErrorCode | null>(null);

  // Only react to a wallet reply while a connect flow we initiated is in
  // flight — see the module doc comment on why restored sessions are inert.
  const connectingRef = useRef(false);
  // Dedupes the verify POST against the same proof signature (StrictMode's
  // double-invoked effects, and re-renders while `wallet` is unchanged).
  const submittedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnectionRestored || !connectingRef.current) return;
    if (!wallet) return;

    const tonProofItem = wallet.connectItems?.tonProof;
    if (!tonProofItem || !("proof" in tonProofItem)) {
      // Wallet connected but declined (or doesn't support) ton_proof —
      // per spec this is not an accepted connection; undo it.
      connectingRef.current = false;
      setStatus("idle");
      setError("proof_declined");
      void tonConnectUI.disconnect().catch(() => undefined);
      return;
    }

    const { proof } = tonProofItem;
    if (submittedSignatureRef.current === proof.signature) return;
    submittedSignatureRef.current = proof.signature;

    setStatus("verifying");
    setError(null);
    verifyWalletProof({ account: wallet.account, proof })
      .then((me) => {
        queryClient.setQueryData(authKeys.me, me);
        connectingRef.current = false;
        setStatus("idle");
      })
      .catch(() => {
        connectingRef.current = false;
        setStatus("idle");
        setError("verify_failed");
        void tonConnectUI.disconnect().catch(() => undefined);
      });
  }, [wallet, isConnectionRestored, tonConnectUI, queryClient]);

  // If the user dismisses the picker without selecting a wallet, drop back
  // to idle instead of leaving the UI stuck in "connecting".
  useEffect(() => {
    return tonConnectUI.onModalStateChange((state) => {
      if (
        connectingRef.current &&
        state.status === "closed" &&
        state.closeReason === "action-cancelled"
      ) {
        connectingRef.current = false;
        setStatus((current) => (current === "connecting" ? "idle" : current));
      }
    });
  }, [tonConnectUI]);

  const connect = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    try {
      const challenge = await fetchWalletProofChallenge();
      tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: { tonProof: challenge.payload },
      });
      const rawNetwork =
        typeof import.meta.env.VITE_TON_NETWORK === "string"
          ? import.meta.env.VITE_TON_NETWORK
          : "testnet";
      tonConnectUI.setConnectionNetwork(
        rawNetwork === "mainnet" ? CHAIN.MAINNET : CHAIN.TESTNET,
      );
      submittedSignatureRef.current = null;
      connectingRef.current = true;
      await tonConnectUI.openModal();
    } catch {
      connectingRef.current = false;
      tonConnectUI.setConnectRequestParameters(null);
      setStatus("idle");
      setError("challenge_failed");
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    setStatus("disconnecting");
    setError(null);
    try {
      await tonConnectUI.disconnect();
      await disconnectWalletBinding();
    } catch {
      setError("disconnect_failed");
    } finally {
      connectingRef.current = false;
      submittedSignatureRef.current = null;
      setStatus("idle");
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
    }
  }, [tonConnectUI, queryClient]);

  return {
    status,
    error,
    isBusy: status !== "idle",
    connect,
    disconnect,
  };
}

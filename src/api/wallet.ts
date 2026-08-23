import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import type { Account, TonProofItemReplySuccess } from "@tonconnect/ui-react";
import { postJson, requestJson } from "./http";
import {
  meResponseSchema,
  walletBalanceSchema,
  walletProofChallengeSchema,
  type MeResponse,
  type WalletBalance,
  type WalletProofChallenge,
} from "./schemas";

/** POST /v1/wallet/proof/challenge — fresh ton_proof payload to bind into
 *  the next TonConnect connect request (§13.5). No body. */
export function fetchWalletProofChallenge(): Promise<WalletProofChallenge> {
  return postJson(
    "/v1/wallet/proof/challenge",
    undefined,
    walletProofChallengeSchema,
  );
}

/** Body for POST /v1/wallet/proof/verify — the wallet's connected account
 *  plus the `ton_proof` reply's `proof` payload (docs/05-frontend-spec.md §4.1). */
export interface WalletProofVerifyPayload {
  account: Account;
  proof: TonProofItemReplySuccess["proof"];
}

/** POST /v1/wallet/proof/verify — binds the proven address to the TG
 *  account; response is `MeResponse` with `wallet` filled.
 *
 *  The server expects `address`/`network`/`publicKey`/`walletStateInit` as
 *  flat top-level fields (see `wallet-proof/routes.ts`'s `verifyBody`), not
 *  TonConnect's nested `Account` shape (`{ address, chain, publicKey,
 *  walletStateInit }`) — flatten here, renaming `chain` -> `network`
 *  (the server's `mapNetwork()` accepts either the raw CHAIN id or a
 *  "mainnet"/"testnet" word, so the raw value can be forwarded as-is). */
export function verifyWalletProof(
  payload: WalletProofVerifyPayload,
): Promise<MeResponse> {
  const { account, proof } = payload;
  return postJson(
    "/v1/wallet/proof/verify",
    {
      address: account.address,
      network: account.chain,
      publicKey: account.publicKey,
      walletStateInit: account.walletStateInit,
      proof,
    },
    meResponseSchema,
  );
}

/** POST /v1/wallet/disconnect — revokes the wallet binding server-side.
 *  Response shape isn't pinned by the spec; callers refetch `me` after. */
export function disconnectWalletBinding(): Promise<unknown> {
  return postJson("/v1/wallet/disconnect", undefined, z.unknown());
}

/** GET /v1/wallet/balance — the caller's bound wallet's live TON balance.
 *  Session-authenticated, no params. 404 `no_wallet` when nothing is bound
 *  (see {@link walletBalanceSchema}). */
export function fetchWalletBalance(): Promise<WalletBalance> {
  return requestJson("/v1/wallet/balance", walletBalanceSchema);
}

export const walletKeys = {
  balance: ["wallet", "balance"] as const,
};

/** Only meaningful once a wallet is bound — callers gate `enabled` on
 *  `me.wallet !== null` (mirrors `useReferralsQuery`'s pattern). No retry:
 *  a 404 `no_wallet` isn't worth retrying, and the header popover offers a
 *  natural re-fetch (close/reopen) for transient failures. */
export function useWalletBalanceQuery(enabled: boolean) {
  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: fetchWalletBalance,
    enabled,
    retry: false,
  });
}

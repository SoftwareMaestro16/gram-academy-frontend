import { z } from "zod";
import type { Account, TonProofItemReplySuccess } from "@tonconnect/ui-react";
import { postJson } from "./http";
import {
  meResponseSchema,
  walletProofChallengeSchema,
  type MeResponse,
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
 *  account; response is `MeResponse` with `wallet` filled. */
export function verifyWalletProof(
  payload: WalletProofVerifyPayload,
): Promise<MeResponse> {
  return postJson("/v1/wallet/proof/verify", payload, meResponseSchema);
}

/** POST /v1/wallet/disconnect — revokes the wallet binding server-side.
 *  Response shape isn't pinned by the spec; callers refetch `me` after. */
export function disconnectWalletBinding(): Promise<unknown> {
  return postJson("/v1/wallet/disconnect", undefined, z.unknown());
}

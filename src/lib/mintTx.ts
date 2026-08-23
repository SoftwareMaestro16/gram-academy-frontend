import { CHAIN, type SendTransactionRequest } from "@tonconnect/ui-react";
import type { MintIntentDto } from "../api/schemas";

/**
 * Builds the TON Connect `sendTransaction` request for a mint intent
 * (docs/05-frontend-spec.md §4.2's `makeTx` pattern). The client never
 * inspects or rebuilds `payloadBase64`/`amountNano` — they are relayed to the
 * wallet exactly as the server signed/computed them (CLAUDE.md: the client
 * holds zero business logic).
 *
 * `validUntil` is the wallet-facing deadline: capped to 5 minutes from now,
 * but never later than the server's reservation TTL (`intent.validUntil`),
 * so the wallet can't hold a stale request open past the reservation expiring.
 */
export function buildMintTransaction(intent: MintIntentDto): SendTransactionRequest {
  return {
    validUntil: Math.min(Math.floor(Date.now() / 1000) + 300, intent.validUntil),
    network: CHAIN.TESTNET,
    messages: [
      {
        address: intent.collectionAddress,
        amount: intent.amountNano,
        payload: intent.payloadBase64,
      },
    ],
  };
}

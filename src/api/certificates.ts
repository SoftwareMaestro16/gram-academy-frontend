import { useQuery } from "@tanstack/react-query";
import { postJson, requestJson } from "./http";
import {
  certificatesMyResponseSchema,
  mintIntentSchema,
  type CertificateMint,
  type MintIntentDto,
} from "./schemas";

/**
 * Certificate mint flow (master-spec §13.5/§13.6, docs/05-frontend-spec.md
 * §4.2). The client holds zero mint business logic: `amountNano` and
 * `payloadBase64` are relayed to TON Connect as-is (`lib/mintTx.ts`), and a
 * mint is only ever considered successful once `GET /v1/certificates/my`
 * reports the matching row as `CONFIRMED` — never on `sendTransaction`
 * resolving.
 */

/** POST /v1/certificates/mint-intent { courseSlug } -> MintIntentDto.
 *  Idempotent while a non-expired RESERVED record exists for the course (same
 *  serial/signature returned); 403 course_not_completed, 409 already_minted,
 *  409 wallet_required. */
export function requestMintIntent(courseSlug: string): Promise<MintIntentDto> {
  return postJson(
    "/v1/certificates/mint-intent",
    { courseSlug },
    mintIntentSchema,
  );
}

/** GET /v1/certificates/my — every mint reservation/record on the caller's
 *  account (all courses). */
export function fetchCertificatesMy(): Promise<CertificateMint[]> {
  return requestJson("/v1/certificates/my", certificatesMyResponseSchema);
}

export const certificateKeys = {
  my: ["certificates", "my"] as const,
};

/** Polls `GET /v1/certificates/my` every 5s while any record is still
 *  RESERVED (docs/05-frontend-spec.md §4.2's established pattern), and stops
 *  once every record has settled (CONFIRMED or EXPIRED) — the client never
 *  runs its own confirmation timer. */
export function useCertificatesMyQuery() {
  return useQuery({
    queryKey: certificateKeys.my,
    queryFn: fetchCertificatesMy,
    refetchInterval: (query) =>
      query.state.data?.some((c) => c.status === "RESERVED") ? 5000 : false,
  });
}

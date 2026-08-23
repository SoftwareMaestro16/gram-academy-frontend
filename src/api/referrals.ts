import { queryOptions, useQuery } from "@tanstack/react-query";
import { requestJson } from "./http";
import { referralsSchema, type Referrals } from "./schemas";

/** GET /v1/referrals/my — invite stats + the server-built referral link
 *  (docs/08-referral-and-mint-integrity.md §6). `referralLink` is null until
 *  the caller has a verified wallet. */
export function fetchReferrals(): Promise<Referrals> {
  return requestJson("/v1/referrals/my", referralsSchema);
}

export const referralsKeys = {
  my: ["referrals", "my"] as const,
};

export function referralsQueryOptions() {
  return queryOptions({
    queryKey: referralsKeys.my,
    queryFn: fetchReferrals,
  });
}

/** Only meaningful once the user has a verified wallet — callers gate
 *  `enabled` on `me.wallet !== null` (the server 200s regardless, but the
 *  link is null without a wallet, so there's nothing to fetch for). */
export function useReferralsQuery(enabled: boolean) {
  return useQuery({ ...referralsQueryOptions(), enabled });
}

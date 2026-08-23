import type { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./http";
import { authTelegram } from "./auth";
import { authKeys } from "./queries";
import { getTelegramInitData } from "../lib/telegram";

let reauthInFlight: Promise<void> | null = null;

/**
 * Global 401 recovery. When any query or mutation fails with 401 (expired
 * session), re-run initData auth ONCE and refetch all active queries. A burst
 * of 401s triggers a single re-auth (deduplicated). Outside Telegram (no
 * initData) it no-ops and the screen keeps its error state.
 */
export function handleAuthError(error: unknown, queryClient: QueryClient): void {
  if (!(error instanceof ApiError) || error.status !== 401) return;
  if (reauthInFlight) return;

  const initData = getTelegramInitData();
  if (!initData) return;

  reauthInFlight = authTelegram(initData)
    .then((me) => {
      queryClient.setQueryData(authKeys.me, me);
      void queryClient.invalidateQueries();
    })
    .catch(() => {
      /* re-auth failed — leave the failing screens showing their error state */
    })
    .finally(() => {
      reauthInFlight = null;
    });
}

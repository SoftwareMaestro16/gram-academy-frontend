import { postJson, patchJson, requestJson } from "./http";
import { meResponseSchema, type Locale, type MeResponse } from "./schemas";

/** POST /v1/auth/telegram — exchange launch initData for a session cookie. */
export function authTelegram(initData: string): Promise<MeResponse> {
  return postJson("/v1/auth/telegram", { initData }, meResponseSchema);
}

/** GET /v1/auth/me — current session identity + wallet/referral state. */
export function fetchMe(): Promise<MeResponse> {
  return requestJson("/v1/auth/me", meResponseSchema);
}

/** PATCH /v1/auth/me — persist the user's UI locale choice. */
export function updateLocale(locale: Locale): Promise<MeResponse> {
  return patchJson("/v1/auth/me", { locale }, meResponseSchema);
}

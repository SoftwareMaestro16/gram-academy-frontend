import { postJson } from "./http";
import { purchaseInvoiceResponseSchema, type PurchaseInvoiceResponse } from "./schemas";

/**
 * Telegram Stars purchase flow (master-spec §13.5, docs/05-frontend-spec.md
 * §5). `invoiceLink` is opened via `Telegram.WebApp.openInvoice`
 * (`lib/telegram.ts#openTelegramInvoice`) — the client never talks to the
 * Bot API directly.
 */

/** POST /v1/courses/:slug/purchase-invoice — session, empty body.
 *  409 already_purchased, 400 course_not_paid. */
export function requestPurchaseInvoice(slug: string): Promise<PurchaseInvoiceResponse> {
  return postJson(
    `/v1/courses/${encodeURIComponent(slug)}/purchase-invoice`,
    undefined,
    purchaseInvoiceResponseSchema,
  );
}

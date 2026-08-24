import type { CertificateMint, CertificateMintStatus } from "../../api/schemas";

/**
 * Certificate explorer/link helpers, shared by the mint flow and the course
 * page's "View Certificate" action. The client never derives cert business
 * data — it only finds the caller's own reservation row (by the
 * `<certGroupSlug>-<serial>` tokenName convention, master-spec §13.6) and
 * builds an explorer URL from the server-provided item address. The explorer
 * base switches between mainnet and testnet via `VITE_TON_NETWORK`.
 */

const EXPLORER_BASE =
  import.meta.env.VITE_TON_NETWORK === "mainnet"
    ? "https://tonviewer.com"
    : "https://testnet.tonviewer.com";

/** Tonviewer URL for a minted certificate's NFT item address. */
export function certExplorerUrl(itemAddress: string): string {
  return `${EXPLORER_BASE}/${itemAddress}`;
}

/** The caller's certificate row for `slug` (cert group or course slug),
 *  optionally filtered by on-chain status. Matches on the tokenName prefix
 *  (`<slug>-<serial>`) so no id plumbing is needed client-side. Works for both
 *  the new cert-group model and legacy per-course rows. */
export function findCertificate(
  certificates: CertificateMint[] | undefined,
  slug: string,
  status?: CertificateMintStatus,
): CertificateMint | undefined {
  return certificates?.find(
    (cert) =>
      cert.tokenName.startsWith(`${slug}-`) &&
      (status === undefined || cert.status === status),
  );
}

/** @deprecated Use `findCertificate` — kept as an alias during migration. */
export const findCourseCertificate = findCertificate;

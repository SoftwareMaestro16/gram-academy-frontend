import type { CertificateMint, CertificateMintStatus } from "../../api/schemas";

/**
 * Certificate explorer/link helpers, shared by the mint flow and the course
 * page's "View Certificate" action. The client never derives cert business
 * data — it only finds the caller's own reservation row (by the
 * `<course-slug>-<serial>` tokenName convention, master-spec §13.6) and builds
 * a testnet explorer URL from the server-provided item address.
 */

/** Testnet tonviewer URL for a minted certificate's NFT item address. */
export function certExplorerUrl(itemAddress: string): string {
  return `https://testnet.tonviewer.com/${itemAddress}`;
}

/** The caller's certificate row for `courseSlug`, optionally filtered by
 *  on-chain status. Matches on the tokenName prefix so no courseId plumbing is
 *  needed client-side. */
export function findCourseCertificate(
  certificates: CertificateMint[] | undefined,
  courseSlug: string,
  status?: CertificateMintStatus,
): CertificateMint | undefined {
  return certificates?.find(
    (cert) =>
      cert.tokenName.startsWith(`${courseSlug}-`) &&
      (status === undefined || cert.status === status),
  );
}

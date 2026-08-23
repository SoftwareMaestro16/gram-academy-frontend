// @gram-academy/protocol — public entrypoint.
//
// Re-exports the generated TS contract wrappers, mirrors the compile-time mint
// economics from sources/academy/constants.tolk (as bigint nanotons), the
// message opcodes from sources/academy/messages.tolk, and the token_name helper.
// The backend and frontend consume these values from here — never redefine them.
// ---- Mint economics (MASTER-SPEC §5.2 / docs/03 §3.1). ----
// Compile-time constants of the contract, mirrored here as nanotons (bigint).
// NEVER diverge from constants.tolk.
export const MINT_PRICE = 150000000n; // 0.15 TON — full mint price
export const CERT_ITEM_VALUE = 40000000n; // 0.04 TON — stays on the item
export const REFERRAL_REWARD = 50000000n; // 0.05 TON — to the referrer, if set
export const COLLECTION_MIN_STORAGE = 50000000n; // 0.05 TON — withdraw floor
export const MAX_TOKEN_NAME_BYTES = 32; // token_name byte limit (MASTER-SPEC §13.9)
// ---- Message opcodes (docs/03 §3.3). ----
export const Opcodes = {
    topUp: 0x00000000,
    askToDeployItem: 0x4637289b,
    certificateDeploy: 0x47414344,
    withdrawCollectionBalance: 0x57434f4c,
    collectionRevenueWithdrawn: 0x43524457,
    referralPayout: 0x52454650,
    transfer: 0x5fcc3d14,
    getStaticData: 0x2fcb26a2,
    reportStaticData: 0x8b771735,
    proveOwnership: 0x04ded148,
    ownershipProof: 0x0524c7ae,
    requestOwner: 0xd0c3bfea,
    ownerInfo: 0x0dd607e3,
    excesses: 0xd53276db,
};
// token_name = "<course-slug>-<serial>" (docs/03 §4). Format validation lives on
// the server; this only assembles the canonical string.
export function buildTokenName(slug, serial) {
    return `${slug}-${serial}`;
}
// ---- Generated wrappers ----
// Everything exported by the collection wrapper (classes, storage/message
// structs, reply types, CellRef, TelegramString).
export * from "./wrappers/AcademyCollection.gen.js";
// Item-specific symbols not already exported by the collection wrapper.
export { AcademyCertificate, AcademyCertificateStorage, CertificateConfig, CertificateStorageNotInitialized, NftDataReply, Transfer, GetStaticData, ReportStaticData, ProveOwnership, OwnershipProof, RequestOwner, OwnerInfo, Excesses, } from "./wrappers/AcademyCertificate.gen.js";
// ---- Chain helpers (address + mint-cell assembly). ----
export * from "./chain/index.js";

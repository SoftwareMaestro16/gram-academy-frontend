// @gram-academy/protocol/chain — deterministic item address + mint-cell assembly.
//
// These helpers mirror the on-chain serialization exactly:
//  - certIndex/certItemAddress reproduce `calcCertificateItem` (index =
//    tokenName.bitsHash(); stateInit = item code + CertificateConfig).
//  - buildCertMintCell reproduces `SignedCertificateMint` — the exact cell the
//    backend signs (Ed25519 over its representation hash).
//  - wrapSignedMint reproduces the `AskToDeployItem` body (opcode 0x4637289b).
import { beginCell, contractAddress } from "@ton/core";
import { sha256_sync } from "@ton/crypto";
import { AcademyCertificate } from "../wrappers/AcademyCertificate.gen.js";
// index = SHA256 of the token_name bytes (== slice.bitsHash() on-chain, since the
// name is byte-aligned).
export function certIndex(tokenName) {
    const digest = sha256_sync(Buffer.from(tokenName, "utf8"));
    return BigInt("0x" + digest.toString("hex"));
}
// Deterministic address of the AcademyCertificate item for a given token_name.
// One token_name -> one address, forever.
export function certItemAddress(collectionAddress, tokenName) {
    const index = certIndex(tokenName);
    const configCell = beginCell()
        .storeUint(index, 256)
        .storeAddress(collectionAddress)
        .endCell();
    // CertificateStorageNotInitialized = { config: Cell<CertificateConfig> } — a
    // single ref, 0 data bits.
    const dataCell = beginCell().storeRef(configCell).endCell();
    return contractAddress(0, { code: AcademyCertificate.CodeCell, data: dataCell });
}
// The exact bytes the backend signs: struct SignedCertificateMint (docs/03 §3.3).
export function buildCertMintCell(p) {
    const nameBytes = Buffer.from(p.tokenName, "utf8");
    if (nameBytes.length > 32) {
        throw new Error(`token_name exceeds 32 bytes: "${p.tokenName}" (${nameBytes.length})`);
    }
    return beginCell()
        .storeUint(p.subwalletId, 32)
        .storeUint(p.validSince, 32)
        .storeUint(p.validTill, 32)
        .storeUint(nameBytes.length, 8) // TelegramString: len:uint8 + bytes
        .storeBuffer(nameBytes)
        .storeAddress(p.ownerAddress)
        .storeAddress(p.referrerAddress ?? null) // null -> addr_none (2 bits)
        .storeRef(p.content)
        .endCell();
}
// Wrap a signed cell + its Ed25519 signature into the AskToDeployItem body sent
// to the collection (signature: bits512 inline, signedData: ref).
export function wrapSignedMint(signedCell, signature) {
    if (signature.length !== 64) {
        throw new Error(`Ed25519 signature must be 64 bytes, got ${signature.length}`);
    }
    return beginCell()
        .storeUint(0x4637289b, 32)
        .storeBuffer(signature) // 512 bits
        .storeRef(signedCell)
        .endCell();
}
// Testnet address formatting (docs/03 §7, MASTER-SPEC §13): transaction targets
// use bounceable + testOnly; the user's own wallet is displayed with
// { bounceable: false }.
export function formatAddress(addr, opts) {
    return addr.toString({
        urlSafe: true,
        bounceable: opts?.bounceable ?? true,
        testOnly: opts?.testOnly ?? true,
    });
}
